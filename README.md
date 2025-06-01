# Japan Post Service API Client

[![npm version](https://badge.fury.io/js/japanpost-api.svg)](https://badge.fury.io/js/japanpost-api)
[![CI](https://github.com/seratch/japanpost-api-ts/actions/workflows/tests.yml/badge.svg)](https://github.com/seratch/japanpost-api-ts/actions/workflows/tests.yml)

> 📖 **日本語版のREADMEは[こちら](README_ja.md)をご覧ください** / **For Japanese README, please see [here](README_ja.md)**

A TypeScript client for the Japan Post Service API. This library provides convenient methods to interact with the official Japan Post API endpoints for authentication and address/zipcode search.

Refer to the service's [official documentation](https://lp-api.da.pf.japanpost.jp/) for details.

## Features

Here are the key features:

- ✅ **Obtain authentication tokens using client credentials**
- 🔍 **Search for addresses by postal codes, business postal codes, and digital addresses**
- 🏠 **Search for zip codes by address components**
- 🔄 **Automatic token refresh handling**
- 📄 **Easy pagination for search API calls**
- ⚡ **Automatic retry with rate limit handling**
- 🛡️ **Robust error handling (authentication, rate limits, network errors)**
- ✅ **Automatic input parameter validation**
- 🔧 **Circuit breaker pattern for fault tolerance**

## Installation

```bash
npm i japanpost-api
```

## Basic Usage

```typescript
import { JapanPostAPI } from 'japanpost-api';

const client = new JapanPostAPI({
  client_id: process.env.JAPAN_POST_CLIENT_ID!,
  secret_key: process.env.JAPAN_POST_SECRET_KEY!,
});

// Search for addresses by postal codes, business postal codes, and digital addresses
const search = await client.searchcode({
  search_code: 'A7E2FK2',
});
console.log(search.addresses);

// Search for zip codes by address components
const addresszip = await client.addresszip({
  pref_code: '13',
  city_code: '13101',
});
console.log(addresszip.addresses);

// Auto-pagination for searchcode API
for await (const page of client.searchcodeAll({
  search_code: 'A7E2FK2',
  limit: 10,
})) {
  console.log(page);
}

// Auto-pagination for addresszip API
for await (const page of client.addresszipAll({
  pref_code: "13",
  city_code: "13101",
  limit: 10,
})) {
  console.log(page);
}
```

## Advanced Configuration

### Auto-retry and Circuit Breaker

```typescript
import { 
  JapanPostAPI, 
  RetryOptions, 
  CircuitBreakerOptions 
} from 'japanpost-api';

const retryOptions: RetryOptions = {
  maxRetries: 5,        // Maximum number of retries
  baseDelay: 2000,      // Base delay in milliseconds
  maxDelay: 30000,      // Maximum delay in milliseconds
  backoffMultiplier: 2, // Exponential backoff multiplier
};

const circuitBreakerOptions: CircuitBreakerOptions = {
  failureThreshold: 3,  // Failure threshold
  resetTimeout: 60000,  // Reset timeout in milliseconds
};

const client = new JapanPostAPI(
  {
    client_id: process.env.JAPAN_POST_CLIENT_ID!,
    secret_key: process.env.JAPAN_POST_SECRET_KEY!,
  },
  {
    retryOptions,
    circuitBreakerOptions,
    enableValidation: true, // Enable validation (default: true)
  }
);
```

### Custom Error Handler

```typescript
import { 
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NetworkError
} from 'japanpost-api';

try {
  const result = await client.searchcode({ search_code: '1000001' });
  console.log(result);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication error:', error.message);
    // Logic to re-acquire token
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit error:', error.message);
    if (error.retryAfter) {
      console.log(`Please retry after ${error.retryAfter} seconds`);
    }
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
    console.error('Problematic field:', error.field);
    console.error('Problematic value:', error.value);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
    console.error('Original error:', error.originalError);
  } else {
    console.error('Other error:', error);
  }
}
```

### Input Validation

```typescript
import { 
  validateSearchcodeRequest,
  validateAddresszipRequest,
  isValidPrefCode,
  getPrefCodeFromName
} from 'japanpost-api';

// Manual Validation
try {
  validateSearchcodeRequest({ search_code: '1000001' });
  console.log('Validation successful');
} catch (error) {
  console.error('Validation error:', error.message);
}

// Validate a given prefecture code
if (isValidPrefCode('13')) {
  console.log('Valid prefecture code');
}

// Look up prefecture code from its name
const prefCode = getPrefCodeFromName('Tokyo');
console.log(prefCode); // '13'
```

### Monitoring Circuit Breaker's State

```typescript
// Get circuit breaker state
const state = client.getCircuitBreakerState();
console.log(`Current state: ${state.state}`);
console.log(`Failure count: ${state.failureCount}`);

// Reset if necessary
if (state.state === 'OPEN') {
  client.resetCircuitBreaker();
  console.log('Circuit breaker has been reset');
}

// Dynamically update retry settings
client.updateRetryOptions({
  maxRetries: 10,
  baseDelay: 5000,
});
```

## Error Types

This library provides the following error types:

- `AuthenticationError` - Authentication error (401)
- `AuthorizationError` - Authorization error (403)
- `RateLimitError` - Rate limit error (429)
- `ClientError` - Client error (4xx)
- `ServerError` - Server error (5xx)
- `NetworkError` - Network error
- `ValidationError` - Validation error
- `GeneralAPIError` - Other API errors

## Validation Features

Automatic validation of input parameters includes the following checks:

### SearchcodeRequest
- `search_code`: Postal code or digital address with 3 or more characters
- `page`: Integer of 1 or greater
- `limit`: Integer in the range 1-1000
- `choikitype`: 1 or 2
- `searchtype`: 1 or 2

### AddresszipRequest
- At least one search condition is required
- `pref_code`: Prefecture code 01-47
- `city_code`: 5-digit city code
- Mutual exclusion control of `flg_getcity` and `flg_getpref`

## TypeScript Support

Full TypeScript support enables type-safe development:

```typescript
import { SearchcodeRequest, SearchcodeResponse, PrefCode } from 'japanpost-api';

const request: SearchcodeRequest = {
  search_code: '1000001',
  limit: 100,
};

const prefCode: PrefCode = '13'; // Type-safe prefecture code
```

## License

This project is licensed under the MIT License. See [LICENSE.txt](LICENSE.txt) for details.
