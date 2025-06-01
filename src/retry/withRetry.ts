import { RateLimitError } from "../JapanPostAPIError";
import { debugLog } from "../Logger";
import { RetryOptions, DEFAULT_RETRY_OPTIONS } from "./RetryOptions";

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
