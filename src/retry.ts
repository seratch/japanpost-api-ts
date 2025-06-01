import { RateLimitError, ServerError, NetworkError } from "./JapanPostAPIError";
import { debugLog } from "./Logger";

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Maximum number of retries (default: 3) */
  maxRetries?: number;
  /** Base delay time in milliseconds (default: 1000) */
  baseDelay?: number;
  /** Exponential backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Maximum delay time in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Maximum jitter (random element) in milliseconds (default: 1000) */
  jitter?: number;
  /** Error types to retry */
  retryableErrors?: Array<new (...args: any[]) => Error>;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 30000,
  jitter: 1000,
  retryableErrors: [RateLimitError, ServerError, NetworkError],
};

/**
 * Function that executes retry with exponential backoff
 */
export async function withRetry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      lastError = errorInstance;

      // If this is the last attempt, re-throw the error
      if (attempt === config.maxRetries) {
        throw errorInstance;
      }

      // Check if error is retryable
      const isRetryable = config.retryableErrors.some((ErrorType) => errorInstance instanceof ErrorType);

      if (!isRetryable) {
        throw errorInstance;
      }

      // For rate limit errors, consider Retry-After header
      let delay = calculateDelay(attempt, config);
      if (errorInstance instanceof RateLimitError && errorInstance.retryAfter) {
        delay = Math.max(delay, errorInstance.retryAfter * 1000);
      }

      debugLog(
        () =>
          `Executing retry: ${attempt + 1}/${config.maxRetries + 1}, ` +
          `Error: ${errorInstance.constructor.name}, ` +
          `Wait time: ${delay}ms`,
      );

      await sleep(delay);
    }
  }

  // Should not reach here, but for type safety
  throw lastError || new Error("Unknown error during retry");
}

/**
 * Calculate delay time with exponential backoff
 */
function calculateDelay(attempt: number, config: Required<RetryOptions>): number {
  const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
  const jitter = Math.random() * config.jitter;
  const totalDelay = exponentialDelay + jitter;

  return Math.min(totalDelay, config.maxDelay);
}

/**
 * Wait for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Circuit breaker state
 */
export enum CircuitBreakerState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerOptions {
  /** Failure threshold (circuit opens after this many failures) */
  failureThreshold?: number;
  /** Reset timeout in milliseconds */
  resetTimeout?: number;
  /** Monitoring period in milliseconds */
  monitoringPeriod?: number;
}

/**
 * Basic circuit breaker implementation
 * Protects the system from cascading failures
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions = {}) {
    this.options = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 60000, // 1 minute
      ...options,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitBreakerState.HALF_OPEN;
        debugLog(() => "Circuit breaker: Transitioning to HALF_OPEN state");
      } else {
        throw new Error("Circuit breaker is in OPEN state. Please wait and try again later.");
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.options.resetTimeout;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitBreakerState.CLOSED;
    debugLog(() => "Circuit breaker: Transitioning to CLOSED state");
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      debugLog(() => `Circuit breaker: Transitioning to OPEN state (failure count: ${this.failureCount})`);
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    debugLog(() => "Circuit breaker: Manual reset");
  }
}
