export interface JapanPostAPIErrorOptions {
  status: number;
  body: string;
  headers: Record<string, string>;
}

/**
 * Base class for Japan Post API related errors
 */
export abstract class JapanPostAPIError extends Error {
  status: number;
  headers: Record<string, string>;
  body: string;
  error: JapanPostAPIErrorBody | null;

  constructor({ status, body, headers }: JapanPostAPIErrorOptions, message?: string) {
    const bodyText = body.replace(/\n/g, "").substring(0, 200);
    super(message || `JapanPostAPIError: (status: ${status}, body: ${bodyText} ...)`);

    this.status = status;
    this.headers = headers;
    this.body = body;
    try {
      this.error = JSON.parse(body);
    } catch (e) {
      this.error = null;
    }
  }

  /**
   * Create appropriate error class instance from error response
   */
  static createFromResponse(options: JapanPostAPIErrorOptions): JapanPostAPIError {
    const { status } = options;

    if (status === 401) {
      return new AuthenticationError(options);
    }
    if (status === 403) {
      return new AuthorizationError(options);
    }
    if (status === 429) {
      return new RateLimitError(options);
    }
    if (status >= 400 && status < 500) {
      return new ClientError(options);
    }
    if (status >= 500) {
      return new ServerError(options);
    }

    return new GeneralAPIError(options);
  }
}

/**
 * Authentication error (401 Unauthorized)
 */
export class AuthenticationError extends JapanPostAPIError {
  constructor(options: JapanPostAPIErrorOptions) {
    super(options, `Authentication failed. Token is invalid or expired. (status: ${options.status})`);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization error (403 Forbidden)
 */
export class AuthorizationError extends JapanPostAPIError {
  constructor(options: JapanPostAPIErrorOptions) {
    super(options, `Access denied. Please check your client permissions. (status: ${options.status})`);
    this.name = "AuthorizationError";
  }
}

/**
 * Rate limit error (429 Too Many Requests)
 */
export class RateLimitError extends JapanPostAPIError {
  retryAfter?: number;

  constructor(options: JapanPostAPIErrorOptions) {
    super(options, `Rate limit exceeded. Please wait before retrying. (status: ${options.status})`);
    this.name = "RateLimitError";

    // Get retry time from Retry-After header
    const retryAfterHeader = options.headers["retry-after"] || options.headers["Retry-After"];
    if (retryAfterHeader) {
      this.retryAfter = parseInt(retryAfterHeader, 10);
    }
  }
}

/**
 * Client error (4xx series)
 */
export class ClientError extends JapanPostAPIError {
  constructor(options: JapanPostAPIErrorOptions) {
    super(options, `Request error occurred. Please check your parameters. (status: ${options.status})`);
    this.name = "ClientError";
  }
}

/**
 * Server error (5xx series)
 */
export class ServerError extends JapanPostAPIError {
  constructor(options: JapanPostAPIErrorOptions) {
    super(options, `Server error occurred. Please wait and try again later. (status: ${options.status})`);
    this.name = "ServerError";
  }
}

/**
 * Network error
 */
export class NetworkError extends Error {
  originalError: Error;

  constructor(originalError: Error) {
    super(`Network error occurred: ${originalError.message}`);
    this.name = "NetworkError";
    this.originalError = originalError;
  }
}

/**
 * General API error
 */
export class GeneralAPIError extends JapanPostAPIError {
  constructor(options: JapanPostAPIErrorOptions) {
    super(options);
    this.name = "GeneralAPIError";
  }
}

/**
 * Validation error
 */
export class ValidationError extends Error {
  field: string;
  value: any;

  constructor(field: string, value: any, message: string) {
    super(`Validation error [${field}]: ${message} (value: ${value})`);
    this.name = "ValidationError";
    this.field = field;
    this.value = value;
  }
}

export type JapanPostAPIErrorBody = {
  /**
   * Request ID (tracking code)
   */
  request_id: string;
  /**
   * Error code
   */
  error_code: string;
  /**
   * Error message
   */
  message: string;
};
