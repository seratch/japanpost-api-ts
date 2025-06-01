# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Tasks

### Build and Development
- `npm run build` - Compile TypeScript to JavaScript
- `npm run build:clean` - Clean dist directory and rebuild
- `npm run format` - Format code using Biome (src/ and test/)
- `npm test` - Run formatting check and execute tests with Vitest
- `npm run ci-test` - Run tests in CI mode with coverage

### Running Tests
Tests require valid API credentials as environment variables:
- `JAPAN_POST_CLIENT_ID`
- `JAPAN_POST_SECRET_KEY`

To run a single test file:
```bash
npx vitest test/validation.test.ts
```

## Architecture Overview

This is a TypeScript client library for the Japan Post Service API (郵便番号・デジタルアドレス API) with enterprise-grade features:

### Core Components
1. **JapanPostAPI** (`src/JapanPostAPI.ts`) - Main API client class that handles:
   - Token management with automatic refresh
   - All API endpoints (token, searchcode, addresszip)
   - Pagination support with async iterators
   - Circuit breaker pattern for fault tolerance

2. **Error Handling** (`src/JapanPostAPIError.ts`) - Comprehensive error hierarchy:
   - AuthenticationError, RateLimitError, ValidationError, NetworkError, etc.
   - Each error type includes appropriate context and retry information

3. **Validation** (`src/validation.ts`) - Input parameter validation:
   - Validates all API request parameters before sending
   - Prefecture code validation and name-to-code conversion
   - Clear error messages with field and value information

4. **Retry Logic** (`src/retry.ts`) - Resilient retry mechanism:
   - Exponential backoff with configurable parameters
   - Respects rate limit headers (Retry-After)
   - Circuit breaker to prevent cascading failures

### Request/Response Types
- Strongly typed interfaces for all API operations in `src/request/` and `src/response/`
- Full TypeScript support with discriminated unions and type guards

### Key Design Patterns
1. **Automatic Token Management**: The client automatically obtains and refreshes tokens as needed
2. **Pagination**: Uses async generators for memory-efficient iteration over large result sets
3. **Resilience**: Combines retry logic with circuit breaker for robust error handling
4. **Validation**: Fail-fast approach with clear validation errors before API calls