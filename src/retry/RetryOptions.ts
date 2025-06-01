import { RateLimitError, ServerError, NetworkError } from "../JapanPostAPIError";

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
export const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 30000,
  jitter: 1000,
  retryableErrors: [RateLimitError, ServerError, NetworkError],
};
