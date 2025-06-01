# Japan Post Service API Client

[![npm version](https://badge.fury.io/js/japanpost-api.svg)](https://badge.fury.io/js/japanpost-api)
[![CI](https://github.com/seratch/japanpost-api-ts/actions/workflows/tests.yml/badge.svg)](https://github.com/seratch/japanpost-api-ts/actions/workflows/tests.yml)

> 📖 **For English README, please see [README.md](README.md)** / **英語版のREADMEは[README.md](README.md)をご覧ください**

[郵便番号・デジタルアドレス API](https://lp-api.da.pf.japanpost.jp/) の全てのエンドポイントに対応した TypeScript ライブラリです。

公式ドキュメントの詳細については、サービスの[公式ドキュメント](https://lp-api.da.pf.japanpost.jp/)を参照してください。

## 機能

以下のような機能・特徴があります：

- ✅ **API トークン取得を簡単に行えます**
- 🔍 **郵便番号、事業所個別郵便番号、デジタルアドレスの共通検索**
- 🏠 **住所の一部から該当する郵便番号・住所情報を検索**
- 🔄 **必要な場合、トークンのリフレッシュを自動で行います**
- 📄 **検索のページネーションを簡単に行うことができます**
- ⚡ **レート制限対応の自動リトライ機能**
- 🛡️ **堅牢なエラーハンドリング（認証、レート制限、ネットワークエラーなど）**
- ✅ **入力パラメータの自動バリデーション**
- 🔧 **サーキットブレーカーパターンによる耐障害性**

## インストール

```bash
npm i japanpost-api
```

## 基本的な使用方法

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

## 高度な設定

### リトライとサーキットブレーカーの設定

```typescript
import { 
  JapanPostAPI, 
  RetryOptions, 
  CircuitBreakerOptions 
} from 'japanpost-api';

const retryOptions: RetryOptions = {
  maxRetries: 5,        // 最大リトライ回数
  baseDelay: 2000,      // 基本待機時間（ミリ秒）
  maxDelay: 30000,      // 最大待機時間（ミリ秒）
  backoffMultiplier: 2, // 指数バックオフの倍率
};

const circuitBreakerOptions: CircuitBreakerOptions = {
  failureThreshold: 3,  // 失敗閾値
  resetTimeout: 60000,  // リセット時間（ミリ秒）
};

const client = new JapanPostAPI(
  {
    client_id: process.env.JAPAN_POST_CLIENT_ID!,
    secret_key: process.env.JAPAN_POST_SECRET_KEY!,
  },
  {
    retryOptions,
    circuitBreakerOptions,
    enableValidation: true, // バリデーションを有効化（デフォルト: true）
  }
);
```

### カスタムエラーハンドリング

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
    console.error('認証エラー:', error.message);
    // トークンを再取得するロジック
  } else if (error instanceof RateLimitError) {
    console.error('レート制限エラー:', error.message);
    if (error.retryAfter) {
      console.log(`${error.retryAfter}秒後に再試行してください`);
    }
  } else if (error instanceof ValidationError) {
    console.error('バリデーションエラー:', error.message);
    console.error('問題のあるフィールド:', error.field);
    console.error('問題のある値:', error.value);
  } else if (error instanceof NetworkError) {
    console.error('ネットワークエラー:', error.message);
    console.error('元のエラー:', error.originalError);
  } else {
    console.error('その他のエラー:', error);
  }
}
```

### バリデーション機能

```typescript
import { 
  validateSearchcodeRequest,
  validateAddresszipRequest,
  isValidPrefCode,
  getPrefCodeFromName
} from 'japanpost-api';

// 手動バリデーション
try {
  validateSearchcodeRequest({ search_code: '1000001' });
  console.log('バリデーション成功');
} catch (error) {
  console.error('バリデーションエラー:', error.message);
}

// 都道府県コードのチェック
if (isValidPrefCode('13')) {
  console.log('有効な都道府県コードです');
}

// 都道府県名からコードを取得
const prefCode = getPrefCodeFromName('東京都');
console.log(prefCode); // '13'
```

### サーキットブレーカーの状態監視

```typescript
// サーキットブレーカーの状態を取得
const state = client.getCircuitBreakerState();
console.log(`現在の状態: ${state.state}`);
console.log(`失敗回数: ${state.failureCount}`);

// 必要に応じてリセット
if (state.state === 'OPEN') {
  client.resetCircuitBreaker();
  console.log('サーキットブレーカーをリセットしました');
}

// リトライ設定の動的変更
client.updateRetryOptions({
  maxRetries: 10,
  baseDelay: 5000,
});
```

## エラータイプ

このライブラリは以下のエラータイプを提供します：

- `AuthenticationError` - 認証エラー（401）
- `AuthorizationError` - 認可エラー（403）
- `RateLimitError` - レート制限エラー（429）
- `ClientError` - クライアントエラー（4xx系）
- `ServerError` - サーバーエラー（5xx系）
- `NetworkError` - ネットワークエラー
- `ValidationError` - バリデーションエラー
- `GeneralAPIError` - その他のAPIエラー

## バリデーション機能

入力パラメータの自動バリデーションにより、以下のチェックが行われます：

### SearchcodeRequest
- `search_code`: 3文字以上の郵便番号またはデジタルアドレス
- `page`: 1以上の整数
- `limit`: 1-1000の範囲の整数
- `choikitype`: 1または2
- `searchtype`: 1または2

### AddresszipRequest
- 検索条件の最低1つは必須
- `pref_code`: 01-47の都道府県コード
- `city_code`: 5桁の市区町村コード
- `flg_getcity`と`flg_getpref`の排他制御

## TypeScript サポート

完全なTypeScript対応により、型安全な開発が可能です：

```typescript
import { SearchcodeRequest, SearchcodeResponse, PrefCode } from 'japanpost-api';

const request: SearchcodeRequest = {
  search_code: '1000001',
  limit: 100,
};

const prefCode: PrefCode = '13'; // 型安全な都道府県コード
```

## コントリビューション

コントリビューションを歓迎します！このプロジェクトは[Conventional Commits](https://www.conventionalcommits.org/)に基づく自動リリースを使用しています。

### コントリビューター向けクイックスタート

1. リポジトリをフォーク＆クローン
2. 機能ブランチを作成: `git checkout -b feature/your-feature`
3. 適切なコミットメッセージで変更を行う:
   - `feat:` 新機能
   - `fix:` バグ修正
   - `docs:` ドキュメント変更
4. テストを実行: `npm test`
5. プルリクエストを作成

### 自動リリース

mainブランチへの変更がマージされると、自動的にリリースが公開されます：
- `feat:` → マイナーバージョンアップ
- `fix:` → パッチバージョンアップ
- `feat!:` または `BREAKING CHANGE:` → メジャーバージョンアップ

詳細については[CONTRIBUTING.md](CONTRIBUTING.md)をご覧ください。

## ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。詳細については[LICENSE.txt](LICENSE.txt)をご覧ください。 