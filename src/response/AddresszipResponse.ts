export type AddresszipResponse = {
  /**
   * マッチングレベル
   */
  level: number;
  /**
   * ページ数
   */
  page: number;
  /**
   * 取得最大レコード数
   */
  limit: number;
  /**
   * 該当データ数
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
