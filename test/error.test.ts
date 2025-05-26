import { test, describe, expect } from "vitest";
import { JapanPostAPIError } from "../src/index";

describe("JapanPostAPIError", () => {
  test("can be created", async () => {
    const error = new JapanPostAPIError({
      status: 400,
      body: `{
  "request_id": "2c78dea5-256a-412c-a61a-9d0b6f8db51f",
  "error_code": "400-1029-0002",
  "message": "デジアドの形式が正しくありません"
}`,
      headers: { foo: "bar" },
    });
    expect(error).toBeInstanceOf(JapanPostAPIError);
    expect(error.status).toBe(400);
    expect(error.error?.request_id).toBe("2c78dea5-256a-412c-a61a-9d0b6f8db51f");
  });
});
