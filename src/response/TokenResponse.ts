export type TokenResponse = {
  /**
   * アクセストークン
   */
  token: string;
  /**
   * トークンタイプ
   */
  token_type: string;
  /**
   * 有効秒数
   */
  expires_in: number;
  /**
   * スコープ
   */
  scope: string;
};
