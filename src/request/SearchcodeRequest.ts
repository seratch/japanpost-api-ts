export interface SearchcodeRequest {
  // To override the token
  token?: string;
  /**
   * 郵便番号 / Postal code
   * (3桁以上の数値。入力された値が7桁未満であった場合、入力値から始まるデータをパターン検索する。) /
   * (3 or more digits. If the input value is less than 7 digits, pattern search for data starting with the input value.)
   * - 事業所個別郵便番号 / Business individual postal code
   * - デジタルアドレス / Digital address
   */
  search_code: string;
  /**
   * ページ番号 (デフォルト値:1) / Page number (default: 1)
   */
  page?: number;
  /**
   * 取得最大レコード数 (デフォルト値:1、最大値:1000) / Maximum number of records to retrieve (default: 1, max: 1000)
   */
  limit?: number;
  /**
   * プロバイダーのユーザーID (クエリパラメーター) / Provider user ID (query parameter)
   */
  ec_uid?: string;
  /**
   * 返却する町域フィールドを指定 (指定がない場合はchoikitype=1とみなす) /
   * Specify the town area field to return (if not specified, choikitype=1 is assumed)
   * - `1`: 括弧なし町域フィールド / Town area field without parentheses
   * - `2`: 括弧有り町域フィールド / Town area field with parentheses
   */
  choikitype?: number;
  /**
   * 検索方法を指定 (指定がない場合はsearchtype=1とみなす) /
   * Specify search method (if not specified, searchtype=1 is assumed)
   * - `1`: 郵便番号、事業所個別郵便番号、デジタルアドレスを検索する / Search postal codes, business individual postal codes, and digital addresses
   * - `2`: 郵便番号、デジタルアドレスを検索する (事業所個別郵便番号は検索対象外) / Search postal codes and digital addresses (business individual postal codes are excluded)
   */
  searchtype?: number;
}
