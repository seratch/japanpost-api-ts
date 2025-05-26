export type TokenRequest = {
  /**
   * grant_type (「client_credentials」で固定)
   */
  grant_type: "client_credentials";
  /**
   * クライアントID （固定：テスト用API認証情報画面の"システム情報"参照）
   */
  client_id: string;
  /**
   * シークレットキー （固定：テスト用API認証情報画面の"システム情報"参照）
   */
  secret_key: string;
};
