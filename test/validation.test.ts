import { describe, it, expect } from "vitest";
import {
  validateSearchcodeRequest,
  validateAddresszipRequest,
  isValidPrefCode,
  isValidPrefName,
  getPrefCodeFromName,
} from "../src/request/Validation";
import { ValidationError } from "../src/JapanPostAPIError";

describe("Validation functionality", () => {
  describe("validateSearchcodeRequest", () => {
    it("accepts valid postal codes", () => {
      expect(() => validateSearchcodeRequest({ search_code: "1000001" })).not.toThrow();
      expect(() => validateSearchcodeRequest({ search_code: "100-0001" })).not.toThrow();
      expect(() => validateSearchcodeRequest({ search_code: "100" })).not.toThrow();
    });

    it("accepts valid digital addresses", () => {
      expect(() => validateSearchcodeRequest({ search_code: "A7E2FK2" })).not.toThrow();
    });

    it("throws error for empty search code", () => {
      expect(() => validateSearchcodeRequest({ search_code: "" })).toThrow(ValidationError);
    });

    it("throws error for search code that is too short", () => {
      expect(() => validateSearchcodeRequest({ search_code: "12" })).toThrow(ValidationError);
    });

    it("throws error for invalid page number", () => {
      expect(() =>
        validateSearchcodeRequest({
          search_code: "1000001",
          page: 0,
        }),
      ).toThrow(ValidationError);
    });

    it("throws error for invalid limit", () => {
      expect(() =>
        validateSearchcodeRequest({
          search_code: "1000001",
          limit: 1001,
        }),
      ).toThrow(ValidationError);
    });
  });

  describe("validateAddresszipRequest", () => {
    it("accepts valid prefecture code", () => {
      expect(() => validateAddresszipRequest({ pref_code: "13" })).not.toThrow();
    });

    it("accepts valid city code", () => {
      expect(() => validateAddresszipRequest({ city_code: "13101" })).not.toThrow();
    });

    it("throws error when no search conditions are provided", () => {
      expect(() => validateAddresszipRequest({})).toThrow(ValidationError);
    });

    it("throws error for invalid prefecture code", () => {
      expect(() => validateAddresszipRequest({ pref_code: "48" })).toThrow(ValidationError);
    });

    it("throws error for invalid city code format", () => {
      expect(() => validateAddresszipRequest({ city_code: "131" })).toThrow(ValidationError);
    });

    it("throws error for mutually exclusive flags", () => {
      expect(() =>
        validateAddresszipRequest({
          pref_code: "13",
          flg_getcity: 1,
          flg_getpref: 1,
        }),
      ).toThrow(ValidationError);
    });
  });

  describe("Prefecture-related utilities", () => {
    it("validates correct prefecture codes", () => {
      expect(isValidPrefCode("13")).toBe(true);
      expect(isValidPrefCode("48")).toBe(false);
    });

    it("validates correct prefecture names", () => {
      expect(isValidPrefName("東京都")).toBe(true);
      expect(isValidPrefName("存在しない県")).toBe(false);
    });

    it("gets prefecture code from name", () => {
      expect(getPrefCodeFromName("東京都")).toBe("13");
      expect(getPrefCodeFromName("存在しない県")).toBeUndefined();
    });
  });
});
