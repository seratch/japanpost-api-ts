export interface SearchcodeRequest {
  // To override the token
  token?: string;
  /**
   * 郵便番号
   * (3桁以上の数値。入力された値が7桁未満であった場合、入力値から始まるデータをパターン検索する。)
   * - 事業所個別郵便番号
   * - デジタルアドレス
   */
  search_code: string;
  /**
   * ページ番号 (デフォルト値:1)
   */
  page?: number;
  /**
   * 取得最大レコード数 (デフォルト値:1、最大値:1000)
   */
  limit?: number;
  /**
   * プロバイダーのユーザーID (クエリパラメーター)
   */
  ec_uid?: string;
  /**
   * 返却する町域フィールドを指定 (指定がない場合はchoikitype=1とみなす)
   * - `1`: 括弧なし町域フィールド
   * - `2`: 括弧有り町域フィールド
   */
  choikitype?: number;
  /**
   * 検索方法を指定 (指定がない場合はsearchtype=1とみなす)
   * - `1`: 郵便番号、事業所個別郵便番号、デジタルアドレスを検索する
   * - `2`: 郵便番号、デジタルアドレスを検索する (事業所個別郵便番号は検索対象外)
   */
  searchtype?: number;
}
