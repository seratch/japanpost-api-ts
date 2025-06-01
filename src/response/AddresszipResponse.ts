export type AddresszipResponse = {
  /**
   * マッチングレベル / Matching level
   */
  level: number;
  /**
   * ページ数 / Page number
   */
  page: number;
  /**
   * 取得最大レコード数 / Maximum number of records retrieved
   */
  limit: number;
  /**
   * 該当データ数 / Number of matching data
   */
  count: number;

  addresses: Array<AddressZip>;
};

export interface AddressZip {
  zip_code: string;
  pref_code: string;
  pref_name: string;
  pref_kana: string;
  pref_roma: string;
  city_code: string;
  city_name: string;
  city_kana: string;
  city_roma: string;
  town_name: string;
  town_kana: string;
  town_roma: string;
}
