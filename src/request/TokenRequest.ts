export type TokenRequest = {
  /**
   * grant_type (「client_credentials」で固定) / grant_type (fixed as "client_credentials")
   */
  grant_type: "client_credentials";
  /**
   * クライアントID （固定：テスト用API認証情報画面の"システム情報"参照） /
   * Client ID (fixed: refer to "System Information" on the test API authentication information screen)
   */
  client_id: string;
  /**
   * シークレットキー （固定：テスト用API認証情報画面の"システム情報"参照） /
   * Secret key (fixed: refer to "System Information" on the test API authentication information screen)
   */
  secret_key: string;
};
