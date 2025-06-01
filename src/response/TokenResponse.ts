export type TokenResponse = {
  /**
   * アクセストークン / Access token
   */
  token: string;
  /**
   * トークンタイプ / Token type
   */
  token_type: string;
  /**
   * 有効秒数 / Validity period in seconds
   */
  expires_in: number;
  /**
   * スコープ / Scope
   */
  scope: string;
};
