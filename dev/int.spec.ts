/**
 * Here are your integration tests for the plugin.
 * They don't require running your Next.js so they are fast
 * Yet they still can test the Local API and custom endpoints using NextRESTClient helper.
 */

import type { Payload } from "payload";

import dotenv from "dotenv";
import path from "path";
import { getPayload } from "payload";
import { fileURLToPath } from "url";

import { NextRESTClient } from "./helpers/NextRESTClient.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

let payload: Payload;
let restClient: NextRESTClient;

describe("Plugin tests", () => {
  beforeAll(async () => {
    process.env.DISABLE_PAYLOAD_HMR = "true";
    process.env.PAYLOAD_DROP_DATABASE = "true";

    dotenv.config({
      path: path.resolve(dirname, "./.env"),
    });

    const { default: config } = await import("./payload.config.js");

    payload = await getPayload({ config });
    restClient = new NextRESTClient(payload.config);
  });

  afterAll(async () => {
    if (payload.db.destroy) {
      await payload.db.destroy();
    }
  });

  it("audit logs collection is defined upon instantiation", () => {
    expect(payload.collections["audit-log"]).toBeDefined();
    expect(payload.collections["audit-log"].config).toBeDefined();
    expect(payload.collections["audit-log"].config.slug).toBeDefined();
  });
});
