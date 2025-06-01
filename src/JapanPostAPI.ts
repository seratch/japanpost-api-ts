import { TokenRequest } from "./request/TokenRequest";
import { TokenResponse } from "./response/TokenResponse";
import { SearchcodeResponse } from "./response/SearchcodeResponse";
import { SearchcodeRequest } from "./request/SearchcodeRequest";
import { AddresszipRequest } from "./request/AddresszipRequest";
import { AddresszipResponse } from "./response/AddresszipResponse";
import { JapanPostAPIError, NetworkError } from "./JapanPostAPIError";
import { debugLog } from "./Logger";
import { validateSearchcodeRequest, validateAddresszipRequest } from "./validation";
import { withRetry, RetryOptions, CircuitBreaker, CircuitBreakerOptions } from "./retry";

const defaultBaseUrl = "https://api.da.pf.japanpost.jp";

export interface JapanPostTokenInitOptions {
  client_id: string;
  secret_key: string;
}

export interface JapanPostAPIOptions {
  baseUrl?: string;
  autoTokenRefresh?: boolean;
  /** Retry configuration */
  retryOptions?: RetryOptions;
  /** Circuit breaker configuration */
  circuitBreakerOptions?: CircuitBreakerOptions;
  /** Whether to enable validation (default: true) */
  enableValidation?: boolean;
}

type TokenInit = string | JapanPostTokenInitOptions;

interface CallParams {
  method: "GET" | "POST";
  path: string;
  pathParams?: Record<string, any>;
  queryParams?: Record<string, any>;
  formParams?: Record<string, any>;
  callTokenRefresh: boolean;
}

export class JapanPostAPI {
  #baseUrl: string;
  #tokenInit: TokenInit;
  #token: string | undefined;
  #tokenExpiresAt: number; // millis
  #autoTokenRefresh: boolean;
  #retryOptions: RetryOptions;
  #circuitBreaker: CircuitBreaker;
  #enableValidation: boolean;

  constructor(tokenInit: TokenInit, options: JapanPostAPIOptions = { baseUrl: defaultBaseUrl }) {
    this.#baseUrl = options.baseUrl ?? defaultBaseUrl;
    this.#tokenInit = tokenInit;
    const tokenPassed = typeof tokenInit === "string";
    if (tokenPassed) {
      this.#token = tokenInit;
    }
    this.#tokenExpiresAt = 0;
    this.#autoTokenRefresh = options.autoTokenRefresh ?? !tokenPassed;
    this.#retryOptions = options.retryOptions ?? {};
    this.#circuitBreaker = new CircuitBreaker(options.circuitBreakerOptions);
    this.#enableValidation = options.enableValidation ?? true;
  }

  async initToken(options?: JapanPostTokenInitOptions): Promise<void> {
    if (typeof this.#tokenInit === "string" && !options) {
      throw new Error("Pass client_id + secret_key to either the constructor or this method");
    }
    const tokenInit = this.#tokenInit as JapanPostTokenInitOptions;
    const response = await this.token({
      grant_type: "client_credentials",
      client_id: options?.client_id ?? tokenInit.client_id,
      secret_key: options?.secret_key ?? tokenInit.secret_key,
    });
    this.setToken(response.token);
    this.#tokenExpiresAt = Date.now() + response.expires_in * 1000;
  }

  setToken(token: string): void {
    this.#token = token;
  }

  tokenExpired(): boolean {
    return Date.now() > this.#tokenExpiresAt;
  }

  async token(request?: TokenRequest): Promise<TokenResponse> {
    if (typeof this.#tokenInit === "string" && !request) {
      throw new Error("Pass client_id + secret_key to the constructor");
    }
    const tokenInit = this.#tokenInit as JapanPostTokenInitOptions;
    const formParams = request ?? {
      grant_type: "client_credentials",
      client_id: tokenInit.client_id,
      secret_key: tokenInit.secret_key,
    };
    return this.#call<TokenResponse>({
      method: "POST",
      path: "/api/v1/j/token",
      formParams,
      callTokenRefresh: false,
    });
  }

  async searchcode(request: SearchcodeRequest): Promise<SearchcodeResponse> {
    // Execute validation
    if (this.#enableValidation) {
      validateSearchcodeRequest(request);
    }

    const searchCode = request.search_code.replace("-", "");
    const queryParams: Record<string, any> = { ...request };
    delete queryParams["search_code"];
    return this.#call<SearchcodeResponse>({
      method: "GET",
      path: "/api/v1/searchcode/{search_code}",
      pathParams: { search_code: searchCode },
      queryParams,
      callTokenRefresh: this.#autoTokenRefresh,
    });
  }

  async *searchcodeAll(request: SearchcodeRequest): AsyncGenerator<SearchcodeResponse, void, unknown> {
    // Execute validation
    if (this.#enableValidation) {
      validateSearchcodeRequest(request);
    }

    let page = request.page ?? 1;
    const limit = request.limit ?? 1000;
    while (true) {
      const response = await this.searchcode({ ...request, page, limit });
      if (!response.addresses || response.addresses.length === 0) {
        break;
      }
      yield response;
      if (response.addresses.length < limit) {
        break;
      }
      page++;
    }
  }

  async addresszip(request: AddresszipRequest): Promise<AddresszipResponse> {
    // Execute validation
    if (this.#enableValidation) {
      validateAddresszipRequest(request);
    }

    return this.#call<AddresszipResponse>({
      method: "POST",
      path: "/api/v1/addresszip",
      formParams: request,
      callTokenRefresh: this.#autoTokenRefresh,
    });
  }

  async *addresszipAll(request: AddresszipRequest): AsyncGenerator<AddresszipResponse, void, unknown> {
    // Execute validation
    if (this.#enableValidation) {
      validateAddresszipRequest(request);
    }

    let page = request.page ?? 1;
    const limit = request.limit ?? 1000;
    while (true) {
      const response = await this.addresszip({ ...request, page, limit });
      if (!response.addresses || response.addresses.length === 0) {
        break;
      }
      yield response;
      if (response.addresses.length < limit) {
        break;
      }
      page++;
    }
  }

  /**
   * Update retry configuration
   */
  updateRetryOptions(options: RetryOptions): void {
    this.#retryOptions = { ...this.#retryOptions, ...options };
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState() {
    return {
      state: this.#circuitBreaker.getState(),
      failureCount: this.#circuitBreaker.getFailureCount(),
    };
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.#circuitBreaker.reset();
  }

  async #call<Response>({
    method,
    path,
    pathParams,
    queryParams,
    formParams,
    callTokenRefresh,
  }: CallParams): Promise<Response> {
    // Execute API call with circuit breaker and retry functionality
    return await this.#circuitBreaker.execute(async () => {
      return await withRetry(async () => {
        if (callTokenRefresh && this.tokenExpired()) {
          debugLog(() => {
            if (this.#token) {
              return "Token expired, refreshing...";
            } else {
              return "No token, initializing...";
            }
          });
          await this.initToken();
        }

        const finalPath = path.replace(/{([^}]+)}/g, (match, key) => pathParams?.[key] ?? match);
        const query =
          Object.keys(queryParams || {}).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : "";
        const url = `${this.#baseUrl}${finalPath}`.replace("//api", "/api") + query;
        const token = formParams ? (formParams.token ?? this.#token) : this.#token;
        const _params: any = {};
        Object.assign(_params, formParams);
        if (_params && _params.token) {
          delete _params.token;
        }
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const body = method === "POST" ? JSON.stringify(_params) : undefined;
        debugLog(() => `JapanPost API request (${method} ${url}): ${body}`);
        const request: Request = new Request(url, { method, headers, body });
        let response: globalThis.Response | null = null;
        let responseBody: string | null = null;
        try {
          response = await fetch(request);
          responseBody = await response.text();
          debugLog(() => {
            if (response !== null) {
              return `JapanPost API response - url: ${response.url}, status: ${response.status}, body: ${responseBody}`;
            } else {
              return `JapanPost API response - body: ${responseBody}`;
            }
          });
          const body = JSON.parse(responseBody);
          if (body.error_code) {
            throw JapanPostAPIError.createFromResponse({
              status: response.status,
              body: responseBody,
              headers: Object.fromEntries(response.headers),
            });
          }
          return body;
        } catch (e: unknown) {
          debugLog(() => `JapanPost API error: ${e}`);
          if (response) {
            throw JapanPostAPIError.createFromResponse({
              status: response.status,
              body: responseBody || "",
              headers: Object.fromEntries(response.headers),
            });
          } else {
            // Treat as network error
            const error = e instanceof Error ? e : new Error(String(e));
            throw new NetworkError(error);
          }
        }
      }, this.#retryOptions);
    });
  }
}
