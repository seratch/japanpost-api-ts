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
