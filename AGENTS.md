# AGENTS.md

This document describes the core agents (classes, utilities, and relevant types) that orchestrate the main logic for the `japanpost-api` TypeScript library.

## Main Agents Overview

| Agent/Class            | Responsibility / Description                                                                    |
|------------------------|-----------------------------------------------------------------------------------------------|
| `JapanPostAPI`         | Main entry point: handles authentication, search, error handling, validation, retries, and circuit breaker. |
| `JapanPostAPIError`    | Base class for errors from the JapanPost API. Specialized subclasses per error type.           |
| `Logger` (`debugLog`)  | Utility for debug-level logging throughout the SDK.                                            |
| `withRetry`            | Function to automatically retry operations with backoff and error-type heuristics.             |
| `CircuitBreaker`       | Implements circuit breaker pattern for (optionally) wrapping API calls.                        |
| `validateSearchcodeRequest`, `validateAddresszipRequest` | Utility functions that validate request parameters and throw `ValidationError` on failure.  |

---

## 1. `JapanPostAPI` (src/JapanPostAPI.ts)
**Role:** Main high-level agent for the user's API interaction.
- Handles:
  - Token management (fetch/refresh)
  - Parameter validation (via utility functions)
  - API endpoint communication
  - Error handling and translation
  - Retry and circuit breaker patterns (configurable)
- Takes options such as credentials, base URL, validation toggle, retry/circuit-breaker settings.

**Example flow:**  
User constructs a `JapanPostAPI` instance → calls address/code search method → transparently includes token logic, request validation, error-to-exception conversion, retry/circuit-breaker.

---

## 2. Error Model: `JapanPostAPIError` and Subclasses (src/JapanPostAPIError.ts)
- `JapanPostAPIError`: Abstract base class for all API-related error cases.
  - Holds HTTP status, headers, response body, and parsed error payload.
- Specialized subclasses for error distinction:
  - `AuthenticationError`
  - `AuthorizationError`
  - `RateLimitError`
  - `ClientError`
  - `ServerError`
  - `NetworkError`
  - `GeneralAPIError`
  - `ValidationError` (for parameter pre-checks, not HTTP errors per se)

---

## 3. Logger (src/Logger.ts)
- `debugLog(fn)`: Utility to emit contextual debug logging using the `debug` package.
- All internal logging should use this for consistency and optional output via environment.

---

## 4. Retry & Circuit Breaker (src/retry.ts)
### `withRetry`
- Wraps async operations with retry logic using exponential backoff, jitter, and error class whitelisting.

### `CircuitBreaker`
- Simple implementation of the circuit breaker pattern, tracking error rates and pausing execution on repeated failure (to facilitate partial disruption-tolerance).

---

## 5. Validation Utilities (src/validation.ts)
- Request validation functions (e.g. `validateSearchcodeRequest`, `validateAddresszipRequest`).
- Utility functions to check/convert prefecture codes, validate address formats, etc.
- Throws `ValidationError` if input is malformed before making requests.

---

## 6. Data Model Types
 - `SearchcodeRequest`, `AddresszipRequest`, `TokenRequest` (in `src/request/`)
 - `SearchcodeResponse`, `AddresszipResponse`, `TokenResponse` (in `src/response/`)
 - All are simple TypeScript types/interfaces to describe API input/output data.

---

## Test Agents (found in `/test/`)
- `api.test.ts`, `error.test.ts`, `logger.test.ts`, `validation.test.ts`
  - Not runtime "agents", but show examples of usage, error handling, config, etc.

---

## How These Agents Work Together

- **User creates** a `JapanPostAPI` instance with credentials and options.
- **When a search is triggered**, the API agent:
  - Validates input using utility agents,
  - Handles token acquisition/renewal,
  - Applies retry & circuit breaker wrappers as needed,
  - Logs with the logger agent,
  - Parses the response (success or error, raising errors using error agents).
- **On validation problems**, throws `ValidationError` directly, before any HTTP request is sent.
- **On HTTP/API errors,** raises a hierarchy of error subclasses.

---

## Extending or Customizing Agents

- API, retry, and validation behavior is open to extension by configuring the main agent or by replacing internal agents in advanced use.

---

**See `README.md` for end-to-end usage examples of these agents.**

---
