import { test, describe } from "vitest";
import { debugLog } from "../src/Logger";
import debug from "debug";

describe("Logger", () => {
  test("debugLog", async () => {
    debug.enable("japanpost-api");
    debugLog(() => "test");
    debug.disable();
  });
});
