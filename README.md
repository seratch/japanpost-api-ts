# Japan Post Service API Client

[![npm version](https://badge.fury.io/js/japanpost-api.svg)](https://badge.fury.io/js/japanpost-api)

[郵便番号・デジタルアドレス API](https://lp-api.da.pf.japanpost.jp/) の全てのエンドポイントに対応した TypeScript ライブラリです。

A TypeScript client for the Japan Post Service API. This library provides convenient methods to interact with the official Japan Post API endpoints for authentication and address/zipcode search.

Refer to the service's [official documentation](https://lp-api.da.pf.japanpost.jp/) for details.

## Features

以下のような機能・特徴があります：

- 依存ライブラリなしで TypeScript で書かれています
- API トークン取得を簡単に行えます
- 郵便番号、事業所個別郵便番号、デジタルアドレスの共通検索
- 住所の一部から該当する郵便番号・住所情報を検索
- 必要な場合、トークンのリフレッシュを自動で行います
- 検索のページネーションを簡単に行うことができます

Here are the key features:

- Fully written in TypeScript, zero dependencies
- Obtain authentication tokens using client credentials
- Search for addresses by code
- Search for zip codes by address
- Automatic token refresh handling
- Easy pagination for search API calls

## Installation

```bash
npm i japanpost-api
```

## Usage

```typescript
import { JapanPostAPI } from 'japanpost-api';

const client = new JapanPostAPI({
  client_id: process.env.JAPAN_POST_CLIENT_ID!,
  secret_key: process.env.JAPAN_POST_SECRET_KEY!,
});

// 郵便番号、事業所個別郵便番号、デジタルアドレスの共通検索

const search = await client.searchcode({
  search_code: 'A7E2FK2',
});
console.log(search.addresses);

// 住所の一部から該当する郵便番号・住所情報を検索

const addresszip = await client.addresszip({
  pref_code: '13',
  city_code: '13101',
});
console.log(addresszip.addresses);

// 検索のページネーションを自動で行う

for await (const page of client.searchcodeAll({
  search_code: 'A7E2FK2',
  limit: 10,
})) {
  console.log(page);
}

for await (const page of client.addresszipAll({
  pref_code: "13",
  city_code: "13101",
  limit: 10,
})) {
  console.log(page);
}
```

## License

This project is licensed under the MIT License. See [LICENSE.txt](LICENSE.txt) for details.
