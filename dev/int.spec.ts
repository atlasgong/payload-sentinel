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
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { getPostFixture } from "./__fixtures__/post.js";
import { getUserFixture } from "./__fixtures__/user.js";
import { NextRESTClient } from "./helpers/NextRESTClient.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(dirname, "./.env"),
});

process.env.DISABLE_PAYLOAD_HMR = "true";
process.env.PAYLOAD_DROP_DATABASE = "true";

describe("plugin tests with default config", () => {
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

  afterAll(async () => {
    if (payload?.db?.destroy) {
      await payload.db.destroy();
    }
  });

  describe("instantiation", () => {
    it("plugin is defined", async () => {
      const { default: config } = await import("./payload.config.js");
      const resolvedConfig = await config;
      expect(resolvedConfig.plugins[0]).toBeDefined();
    });

    it("audit logs collection is injected", () => {
      expect(payload.collections["audit-log"]).toBeDefined();
      expect(payload.collections["audit-log"].config).toBeDefined();
      expect(payload.collections["audit-log"].config.slug).toBe("audit-log");
    });
  });

  describe("crud operations are logged", () => {
    it("create collection", async () => {
      try {
        // get user to associate with the audit log
        const user = await getUserFixture(payload);

        // create arbitrary post
        const createdDoc = await payload.create({
          collection: "posts",
          data: {
            example: "jvgkjhsagdfds",
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

        expect(logs.totalDocs).toBeGreaterThan(0);

        const log = logs.docs[0];
        expect(log.documentId).toStrictEqual(String(createdDoc.id));
        expect(log.operation).toBe("create");
      } finally {
        // wait for operations to complete
        await new Promise((resolve) => process.nextTick(resolve));
      }
    });

    it("update collection", async () => {
      try {
        // get user to associate with the audit log
        const user = await getUserFixture(payload);

        // get arbitrary post
        const post = await getPostFixture(payload);

        await payload.update({
          id: post.id,
          collection: "posts",
          data: {
            example: "TEST",
          },
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

        expect(logs.totalDocs).toBeGreaterThan(0);

        const log = logs.docs[0];
        expect(log.documentId).toStrictEqual(String(post.id));
        expect(log.operation).toBe("update");
      } finally {
        // wait for operations to complete
        await new Promise((resolve) => process.nextTick(resolve));
      }
    });

    it("delete collection", async () => {
      try {
        // get user to associate with the audit log
        const user = await getUserFixture(payload);

        // create arbitrary post
        const post = await getPostFixture(payload);

        // delete the post
        await payload.delete({
          id: post.id,
          collection: "posts",
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

        expect(logs.totalDocs).toBeGreaterThan(0);

        const log = logs.docs[0];
        expect(log.documentId).toStrictEqual(String(post.id));
        expect(log.operation).toBe("delete");
      } finally {
        // wait for operations to complete
        await new Promise((resolve) => process.nextTick(resolve));
      }
    });

    it.todo("read collection");

    it("update global", async () => {
      try {
        // get user to associate with the audit log
        const user = await getUserFixture(payload);

        // update the existing 'settings' global
        await payload.updateGlobal({
          slug: "settings",
          data: {
            example: {
              root: {
                type: "root",
                children: [
                  {
                    type: "paragraph",
                    children: [{ text: "woooooo" }],
                  },
                ],
              },
            },
          },
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

        expect(logs.totalDocs).toBeGreaterThan(0);

        const log = logs.docs[0];
        expect(log.documentId).toStrictEqual(String("settings"));
        expect(log.operation).toBe("update");
      } finally {
        // wait for operations to complete
        await new Promise((resolve) => process.nextTick(resolve));
      }
    });

    it.todo("read global");
  });

  it.todo("read access permission denies unauthorized users");
});
