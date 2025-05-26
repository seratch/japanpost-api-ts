export type SearchcodeResponse = {
  /**
   * ページ数 (デフォルト値:1)
   */
  page: number;
  /**
   * 取得最大レコード数 (デフォルト値:1000、最大値:1000)
   */
  limit: number;
  /**
   * 該当データ数
   */
  count: number;
  /**
   * 検索タイプ (dgacode/zipcode/bizzipcodeのいずれか)
   */
  searchtype: string;

  addresses: Array<Address>;
};

export type Address = {
  dgacode: string;
  zip_code: string;
  pref_code: string;
  pref_name: string;
  pref_kana: string | null;
  pref_roma: string | null;
  city_code: string | null;
  city_name: string;
  city_kana: string | null;
  city_roma: string | null;
  town_name: string;
  town_kana: string | null;
  town_roma: string | null;
  biz_name: string | null;
  biz_kana: string | null;
  biz_roma: string | null;
  block_name: string;
  other_name: string | null;
  address: string;
  longitude: string | null;
  latitude: string | null;
};
