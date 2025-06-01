import { ValidationError } from "../JapanPostAPIError";
import { SearchcodeRequest } from "./SearchcodeRequest";
import { AddresszipRequest } from "./AddresszipRequest";

/**
 * Prefecture code Union type (01-47)
 */
export type PrefCode =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "18"
  | "19"
  | "20"
  | "21"
  | "22"
  | "23"
  | "24"
  | "25"
  | "26"
  | "27"
  | "28"
  | "29"
  | "30"
  | "31"
  | "32"
  | "33"
  | "34"
  | "35"
  | "36"
  | "37"
  | "38"
  | "39"
  | "40"
  | "41"
  | "42"
  | "43"
  | "44"
  | "45"
  | "46"
  | "47";

/**
 * Regular expression for validating postal code format
 * 7-digit numbers, or hyphenated format (123-4567)
 */
const POSTAL_CODE_REGEX = /^(\d{7}|\d{3}-\d{4})$/;

/**
 * Regular expression for validating digital address format
 * 7 alphanumeric characters
 */
const DIGITAL_ADDRESS_REGEX = /^[A-Z0-9]{7}$/;

/**
 * Array of prefecture codes
 */
const VALID_PREF_CODES: string[] = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
];

/**
 * Mapping of prefecture names to codes
 */
const PREF_NAME_TO_CODE: Record<string, string> = {
  北海道: "01",
  青森県: "02",
  岩手県: "03",
  宮城県: "04",
  秋田県: "05",
  山形県: "06",
  福島県: "07",
  茨城県: "08",
  栃木県: "09",
  群馬県: "10",
  埼玉県: "11",
  千葉県: "12",
  東京都: "13",
  神奈川県: "14",
  新潟県: "15",
  富山県: "16",
  石川県: "17",
  福井県: "18",
  山梨県: "19",
  長野県: "20",
  岐阜県: "21",
  静岡県: "22",
  愛知県: "23",
  三重県: "24",
  滋賀県: "25",
  京都府: "26",
  大阪府: "27",
  兵庫県: "28",
  奈良県: "29",
  和歌山県: "30",
  鳥取県: "31",
  島根県: "32",
  岡山県: "33",
  広島県: "34",
  山口県: "35",
  徳島県: "36",
  香川県: "37",
  愛媛県: "38",
  高知県: "39",
  福岡県: "40",
  佐賀県: "41",
  長崎県: "42",
  熊本県: "43",
  大分県: "44",
  宮崎県: "45",
  鹿児島県: "46",
  沖縄県: "47",
};

/**
 * Check if a string is numeric
 */
function isNumericString(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Validation for postal code search request
 */
export function validateSearchcodeRequest(request: SearchcodeRequest): void {
  // search_code is required
  if (!request.search_code) {
    throw new ValidationError("search_code", request.search_code, "Postal code or digital address is required");
  }

  const searchCode = request.search_code.replace(/-/g, "");

  // Format check for postal code or digital address
  if (searchCode.length >= 3) {
    // For 3+ characters, check postal code or digital address format
    if (isNumericString(searchCode)) {
      // If numeric, treat as postal code
      if (searchCode.length > 7) {
        throw new ValidationError("search_code", request.search_code, "Postal code must be at most 7 digits");
      }
    } else {
      // If alphanumeric, check digital address format
      if (searchCode.length === 7 && !DIGITAL_ADDRESS_REGEX.test(searchCode.toUpperCase())) {
        throw new ValidationError(
          "search_code",
          request.search_code,
          "Digital address must be 7 alphanumeric characters",
        );
      } else if (searchCode.length !== 7) {
        throw new ValidationError("search_code", request.search_code, "Digital address must be 7 characters");
      }
    }
  } else {
    throw new ValidationError("search_code", request.search_code, "Search code must be at least 3 characters");
  }

  // Page validation
  if (request.page !== undefined) {
    if (!Number.isInteger(request.page) || request.page < 1) {
      throw new ValidationError("page", request.page, "Page number must be an integer of 1 or greater");
    }
  }

  // Limit validation
  if (request.limit !== undefined) {
    if (!Number.isInteger(request.limit) || request.limit < 1 || request.limit > 1000) {
      throw new ValidationError("limit", request.limit, "Limit must be between 1 and 1000");
    }
  }

  // choikitype validation
  if (request.choikitype !== undefined) {
    if (![1, 2].includes(request.choikitype)) {
      throw new ValidationError("choikitype", request.choikitype, "choikitype must be 1 or 2");
    }
  }

  // searchtype validation
  if (request.searchtype !== undefined) {
    if (![1, 2].includes(request.searchtype)) {
      throw new ValidationError("searchtype", request.searchtype, "searchtype must be 1 or 2");
    }
  }
}

/**
 * Validation for address search request
 */
export function validateAddresszipRequest(request: AddresszipRequest): void {
  // At least one search condition is required
  const hasSearchCondition =
    request.pref_code ||
    request.pref_name ||
    request.pref_kana ||
    request.pref_roma ||
    request.city_code ||
    request.city_name ||
    request.city_kana ||
    request.city_roma ||
    request.town_name ||
    request.town_kana ||
    request.town_roma ||
    request.freeword;

  if (!hasSearchCondition) {
    throw new ValidationError("request", request, "At least one search condition must be specified");
  }

  // Prefecture code validation
  if (request.pref_code !== undefined) {
    if (!VALID_PREF_CODES.includes(request.pref_code)) {
      throw new ValidationError("pref_code", request.pref_code, "Invalid prefecture code. Must be in the range 01-47");
    }
  }

  // Prefecture name validation (for reference)
  if (request.pref_name !== undefined) {
    if (typeof request.pref_name !== "string" || request.pref_name.trim().length === 0) {
      throw new ValidationError("pref_name", request.pref_name, "Prefecture name must be a non-empty string");
    }
  }

  // City code validation (5-digit number)
  if (request.city_code !== undefined) {
    if (!/^\d{5}$/.test(request.city_code)) {
      throw new ValidationError("city_code", request.city_code, "City code must be a 5-digit number");
    }
  }

  // Flag validation
  if (request.flg_getcity !== undefined) {
    if (![0, 1].includes(request.flg_getcity)) {
      throw new ValidationError("flg_getcity", request.flg_getcity, "flg_getcity must be 0 or 1");
    }
  }

  if (request.flg_getpref !== undefined) {
    if (![0, 1].includes(request.flg_getpref)) {
      throw new ValidationError("flg_getpref", request.flg_getpref, "flg_getpref must be 0 or 1");
    }
  }

  // Page validation
  if (request.page !== undefined) {
    if (!Number.isInteger(request.page) || request.page < 1) {
      throw new ValidationError("page", request.page, "Page number must be an integer of 1 or greater");
    }
  }

  // Limit validation
  if (request.limit !== undefined) {
    if (!Number.isInteger(request.limit) || request.limit < 1 || request.limit > 1000) {
      throw new ValidationError("limit", request.limit, "Limit must be between 1 and 1000");
    }
  }

  // Check for mutually exclusive flags
  if (request.flg_getcity === 1 && request.flg_getpref === 1) {
    throw new ValidationError(
      "flags",
      { flg_getcity: request.flg_getcity, flg_getpref: request.flg_getpref },
      "flg_getcity and flg_getpref cannot both be set to 1",
    );
  }
}

/**
 * Check if a string is a valid prefecture name
 */
export function isValidPrefName(prefName: string): boolean {
  return prefName in PREF_NAME_TO_CODE;
}

/**
 * Get prefecture code from prefecture name
 */
export function getPrefCodeFromName(prefName: string): string | undefined {
  return PREF_NAME_TO_CODE[prefName];
}

/**
 * Check if prefecture code is valid
 */
export function isValidPrefCode(prefCode: string): prefCode is PrefCode {
  return VALID_PREF_CODES.includes(prefCode);
}
