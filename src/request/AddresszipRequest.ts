export type AddresszipRequest = {
  // To override the token
  token?: string;

  /**
   * 都道府県コード / Prefecture code
   */
  pref_code?: string;
  /**
   * 都道府県名 / Prefecture name
   */
  pref_name?: string;
  /**
   * 都道府県名カナ / Prefecture name in Katakana
   */
  pref_kana?: string;
  /**
   * 都道府県名ローマ字 / Prefecture name in Roman characters
   */
  pref_roma?: string;
  /**
   * 市区町村コード / City/ward/town/village code
   */
  city_code?: string;
  /**
   * 市区町村名 / City/ward/town/village name
   */
  city_name?: string;
  /**
   * 市区町村名カナ / City/ward/town/village name in Katakana
   */
  city_kana?: string;
  /**
   * 市区町村名ローマ字 / City/ward/town/village name in Roman characters
   */
  city_roma?: string;
  /**
   * 町域 / Town area
   */
  town_name?: string;
  /**
   * 町域カナ / Town area in Katakana
   */
  town_kana?: string;
  /**
   * 町域ローマ字 / Town area in Roman characters
   */
  town_roma?: string;
  /**
   * フリーワード / Free word
   */
  freeword?: string;
  /**
   * 市区町村一覧のみ取得フラグ (デフォルト値:0、 0:すべての情報を取得、1:市区町村のみの情報を取得) /
   * Flag to get only city/ward/town/village list (default: 0, 0: get all information, 1: get only city/ward/town/village information)
   */
  flg_getcity?: number;
  /**
   * 都道府県一覧のみ取得フラグ (デフォルト値:0、0:すべての情報を取得、1:都道府県のみの情報を取得) /
   * Flag to get only prefecture list (default: 0, 0: get all information, 1: get only prefecture information)
   */
  flg_getpref?: number;
  /**
   * ページ数 (デフォルト値:1) / Page number (default: 1)
   */
  page?: number;
  /**
   * 取得最大レコード数 (デフォルト値:1000、最大値:1000) / Maximum number of records to retrieve (default: 1000, max: 1000)
   */
  limit?: number;
};
