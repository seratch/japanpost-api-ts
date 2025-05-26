import { assert, test, describe } from "vitest";
import { JapanPostAPI } from "../src/JapanPostAPI";
import { debugLog } from "../src/Logger";

describe("JapanPostAPI", () => {
  test("works with the test endpoints", async () => {
    const client = new JapanPostAPI(
      {
        client_id: process.env.JAPAN_POST_CLIENT_ID!,
        secret_key: process.env.JAPAN_POST_SECRET_KEY!,
      },
      { baseUrl: "https://stub-qz73x.da.pf.japanpost.jp" },
    );
    const search = await client.searchcode({
      search_code: "A7E2FK2",
    });
    debugLog(() => JSON.stringify(search, null, 2));
    assert.isDefined(search.addresses);

    const addresszip = await client.addresszip({
      pref_code: "13",
      city_code: "13101",
    });
    debugLog(() => JSON.stringify(addresszip, null, 2));
    assert.isDefined(addresszip.addresses);
  });

  test("does auto pagination", async () => {
    const client = new JapanPostAPI(
      {
        client_id: process.env.JAPAN_POST_CLIENT_ID!,
        secret_key: process.env.JAPAN_POST_SECRET_KEY!,
      },
      { baseUrl: "https://stub-qz73x.da.pf.japanpost.jp" },
    );
    for await (const page of client.searchcodeAll({
      search_code: "A7E2FK2",
      limit: 10,
    })) {
      debugLog(() => JSON.stringify(page, null, 2));
    }
    for await (const page of client.addresszipAll({
      pref_code: "13",
      city_code: "13101",
      limit: 10,
    })) {
      debugLog(() => JSON.stringify(page, null, 2));
    }
  });
});
