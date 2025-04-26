/**
 * Here are your integration tests for the plugin.
 * They don't require running your Next.js so they are fast
 * Yet they still can test the Local API and custom endpoints using NextRESTClient helper.
 */

import type { Collection, Payload } from "payload";

import dotenv from "dotenv";
import path from "path";
import { getPayload } from "payload";
import { payloadSentinel } from "payload-sentinel";
import { fileURLToPath } from "url";

import { devUser } from "./helpers/credentials.js";
import { NextRESTClient } from "./helpers/NextRESTClient.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(dirname, "./.env"),
});

process.env.DISABLE_PAYLOAD_HMR = "true";
process.env.PAYLOAD_DROP_DATABASE = "true";

describe("Plugin tests with default config", () => {
  let payload: Payload;
  let restClient: NextRESTClient;

  beforeAll(async () => {
    // clean up any existing connections
    if (payload?.db?.destroy) {
      await payload.db.destroy();
    }

    const { default: config } = await import("./payload.config.js");
    payload = await getPayload({ config });
    restClient = new NextRESTClient(payload.config);
  });

  afterAll(() => {
    return new Promise<void>((done) => {
      if (payload?.db?.destroy) {
        payload.db
          .destroy()
          .then(() => {
            done();
          })
          .catch((error) => {
            console.error("Error during cleanup:", error);
            done(error);
          });
      } else {
        done();
      }
    });
  });

  it("plugin is defined upon instantiation", async () => {
    const { default: config } = await import("./payload.config.js");
    const resolvedConfig = await config;
    expect(resolvedConfig.plugins[0]).toBeDefined();
  });

  it("audit logs collection is injected", () => {
    expect(payload.collections["audit-log"]).toBeDefined();
    expect(payload.collections["audit-log"].config).toBeDefined();
    expect(payload.collections["audit-log"].config.slug).toBe("audit-log");
  });

  it("create collection operation works", async () => {
    try {
      // get user to associate with the audit log
      const userResult = await payload.find({
        collection: "users",
        where: {
          email: {
            equals: devUser.email,
          },
        },
      });

      // ensure we found a user
      expect(userResult.docs.length).toBeGreaterThan(0);
      const user = userResult.docs[0];

      // create arbitrary post
      const createdDoc = await payload.create({
        collection: "posts",
        data: {
          example: "test",
        },
        overrideAccess: false,
        user,
      });

      // wait for operations to complete
      await new Promise((resolve) => process.nextTick(resolve));

      // audit log should've been created
      const logs = await payload.find({
        collection: "audit-log",
        limit: 1,
        sort: "-createdAt",
      });

      expect(logs.totalDocs).toBe(1);

      const log = logs.docs[0];
      expect(log.documentId).toStrictEqual(String(createdDoc.id));
    } finally {
      // wait for operations to complete
      await new Promise((resolve) => process.nextTick(resolve));
    }
  });
});

// describe("Plugin tests with custom config", () => {
//   let payload: Payload;
//   let restClient: NextRESTClient;

//   // Combine the two beforeAll hooks into one to avoid duplicate hooks error
//   beforeAll(async () => {
//     // eslint-disable-next-line @typescript-eslint/no-require-imports
//     const payloadSentinelModule = require("payload-sentinel");
//     if (payloadSentinelModule.payloadSentinel.mockRestore) {
//       payloadSentinelModule.payloadSentinel.mockRestore();
//     }
//     jest.spyOn(payloadSentinelModule, "payloadSentinel").mockImplementation(() => ({
//       name: "payload-sentinel",
//       auditLogCollection: "test",
//     }));

//     const { default: config } = await import("./payload.config.js");
//     payload = await getPayload({ config });
//     restClient = new NextRESTClient(payload.config);
//   });

//   afterAll(async () => {
//     if (payload?.db?.destroy) {
//       await payload.db.destroy();
//     }
//   });

//   it("uses custom audit log collection name", () => {
//     const collections = payload.collections as Record<string, Collection>;
//     const collection = collections["test"];
//     expect(collection).toBeDefined();
//     expect(collection.config).toBeDefined();
//     expect(collection.config.slug).toBe("test");
//   });
// });
