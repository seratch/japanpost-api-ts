import { assert, test, describe, expect } from "vitest";
import { JapanPostAPI } from "../src/JapanPostAPI";
import { debugLog } from "../src/Logger";

const testEndpoint = "https://stub-qz73x.da.pf.japanpost.jp";

describe("JapanPostAPI", () => {
  test("works with searchcode", async () => {
    const client = new JapanPostAPI(
      {
        client_id: process.env.JAPAN_POST_CLIENT_ID!,
        secret_key: process.env.JAPAN_POST_SECRET_KEY!,
      },
      { baseUrl: testEndpoint },
    );
    const search = await client.searchcode({
      search_code: "A7E2FK2",
    });
    debugLog(() => JSON.stringify(search, null, 2));
    assert.isDefined(search.addresses);

    const search2 = await client.searchcode({
      search_code: "A7E-2FK2",
    });
    debugLog(() => JSON.stringify(search2, null, 2));
    assert.isDefined(search2.addresses);

    const search3 = await client.searchcode({
      search_code: "1006908",
    });
    debugLog(() => JSON.stringify(search3, null, 2));
    assert.isDefined(search3.addresses);

    const search4 = await client.searchcode({
      search_code: "100-6908",
    });
    debugLog(() => JSON.stringify(search4, null, 2));
    assert.isDefined(search4.addresses);
  });

  test("works with addresszip", async () => {
    const client = new JapanPostAPI(
      {
        client_id: process.env.JAPAN_POST_CLIENT_ID!,
        secret_key: process.env.JAPAN_POST_SECRET_KEY!,
      },
      { baseUrl: testEndpoint },
    );

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
      { baseUrl: testEndpoint },
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
  test("inits with a token", async () => {
    const token = (
      await new JapanPostAPI(
        {
          client_id: process.env.JAPAN_POST_CLIENT_ID!,
          secret_key: process.env.JAPAN_POST_SECRET_KEY!,
        },
        { baseUrl: testEndpoint },
      ).token()
    ).token;
    const client = new JapanPostAPI(token, { baseUrl: testEndpoint });
    const search = await client.searchcode({
      search_code: "A7E2FK2",
    });
    assert.isDefined(search.addresses);
  });
  test("fails to init without credentials", async () => {
    const client = new JapanPostAPI("token", { baseUrl: testEndpoint });
    await expect(client.initToken()).rejects.toThrow();
  });
});
