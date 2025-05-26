export type AddresszipRequest = {
  // To override the token
  token?: string;

  /**
   * 都道府県コード
   */
  pref_code?: string;
  /**
   * 都道府県名
   */
  pref_name?: string;
  /**
   * 都道府県名カナ
   */
  pref_kana?: string;
  /**
   * 都道府県名ローマ字
   */
  pref_roma?: string;
  /**
   * 市区町村コード
   */
  city_code?: string;
  /**
   * 市区町村名
   */
  city_name?: string;
  /**
   * 市区町村名カナ
   */
  city_kana?: string;
  /**
   * 市区町村名ローマ字
   */
  city_roma?: string;
  /**
   * 町域
   */
  town_name?: string;
  /**
   * 町域カナ
   */
  town_kana?: string;
  /**
   * 町域ローマ字
   */
  town_roma?: string;
  /**
   * フリーワード
   */
  freeword?: string;
  /**
   * 市区町村一覧のみ取得フラグ (デフォルト値:0、 0:すべての情報を取得、1:市区町村のみの情報を取得)
   */
  flg_getcity?: number;
  /**
   * 都道府県一覧のみ取得フラグ (デフォルト値:0、0:すべての情報を取得、1:都道府県のみの情報を取得)
   */
  flg_getpref?: number;
  /**
   * ページ数 (デフォルト値:1)
   */
  page?: number;
  /**
   * 取得最大レコード数 (デフォルト値:1000、最大値:1000)
   */
  limit?: number;
};
