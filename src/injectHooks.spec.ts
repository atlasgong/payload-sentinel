import type { BaseDatabaseAdapter, CollectionConfig, Config, GlobalConfig } from "payload";

import { type HookOptions, injectAuditHooks } from "./injectHooks.js";

const defaultTestOptions: HookOptions = {
  auditLogsCollection: "audit-logs",
  disabled: false,
  excludedCollections: [],
  excludedGlobals: [],
  operations: { create: true, delete: true, read: false, update: true },
};

const mockCollection: CollectionConfig = {
  slug: "posts",
  fields: [],
  hooks: {
    // example existing hook
    afterChange: [() => console.log("Existing collection afterChange")],
    beforeChange: [() => console.log("Existing beforeChange")],
  },
};

const mockAuditLogCollection: CollectionConfig = {
  slug: "audit-logs",
  fields: [],
};

const mockExcludedCollection: CollectionConfig = {
  slug: "excluded-collection",
  fields: [],
};

const mockGlobal: GlobalConfig = {
  slug: "settings",
  fields: [],
  hooks: {
    // example existing hook
    afterChange: [() => console.log("Existing global afterChange")],
    beforeRead: [() => console.log("Existing beforeRead")],
  },
};

const mockExcludedGlobal: GlobalConfig = {
  slug: "excluded-global",
  fields: [],
};

describe("injectAuditHooks", () => {
  let mockConfig: Config;

  beforeEach(() => {
    // reset mock config before each test
    mockConfig = {
      collections: [
        // clone objects to prevent mutation across tests
        { ...mockCollection, hooks: { ...(mockCollection.hooks || {}) } },
        { ...mockAuditLogCollection, hooks: { ...(mockAuditLogCollection.hooks || {}) } },
        { ...mockExcludedCollection, hooks: { ...(mockExcludedCollection.hooks || {}) } },
      ],
      globals: [
        { ...mockGlobal, hooks: { ...(mockGlobal.hooks || {}) } },
        { ...mockExcludedGlobal, hooks: { ...(mockExcludedGlobal.hooks || {}) } },
      ],
      // required properties to satisfy Config type (not used by injectAuditHooks)
      db: {
        defaultIDType: "number",
        init(): BaseDatabaseAdapter {
          throw new Error("Function not implemented.");
        },
      },
      secret: "test-secret",
    };
  });

  it("should add audit hooks to a standard collection", () => {
    const options = { ...defaultTestOptions };
    injectAuditHooks(mockConfig, options);

    const targetCollection = mockConfig.collections?.find((c) => c.slug === "posts");
    expect(targetCollection).toBeDefined();
    expect(targetCollection?.hooks?.afterChange).toHaveLength(2); // existing + injected hook
    expect(targetCollection?.hooks?.afterDelete).toHaveLength(1);
    expect(targetCollection?.hooks?.afterRead).toHaveLength(1);
    // ensure existing hooks are kept (adjust based on actual mockCollection)
    expect(targetCollection?.hooks?.beforeChange).toHaveLength(1);
  });

  it("should add audit hooks to a standard global", () => {
    const options = { ...defaultTestOptions };
    injectAuditHooks(mockConfig, options);

    const targetGlobal = mockConfig.globals?.find((g) => g.slug === "settings");
    expect(targetGlobal).toBeDefined();
    expect(targetGlobal?.hooks?.afterChange).toHaveLength(2); // existing + injected hook
    expect(targetGlobal?.hooks?.afterRead).toHaveLength(1);
    // ensure existing hooks are kept (adjust based on actual mockGlobal)
    expect(targetGlobal?.hooks?.beforeRead).toHaveLength(1);
  });

  it("should NOT add hooks to the audit log collection", () => {
    const options = { ...defaultTestOptions };
    injectAuditHooks(mockConfig, options);

    const targetCollection = mockConfig.collections?.find((c) => c.slug === "audit-logs");
    expect(targetCollection).toBeDefined();
    // check that no new hooks were added
    expect(targetCollection?.hooks?.afterChange).toBeUndefined();
    expect(targetCollection?.hooks?.afterDelete).toBeUndefined();
    expect(targetCollection?.hooks?.afterRead).toBeUndefined();
  });

  it("should NOT add hooks to an excluded collection", () => {
    const options: HookOptions = {
      ...defaultTestOptions,
      excludedCollections: ["excluded-collection"],
    };
    injectAuditHooks(mockConfig, options);

    const targetCollection = mockConfig.collections?.find((c) => c.slug === "excluded-collection");
    expect(targetCollection).toBeDefined();
    expect(targetCollection?.hooks?.afterChange).toBeUndefined();
    expect(targetCollection?.hooks?.afterDelete).toBeUndefined();
    expect(targetCollection?.hooks?.afterRead).toBeUndefined();
  });

  it("should NOT add hooks to an excluded global", () => {
    const options: HookOptions = {
      ...defaultTestOptions,
      excludedGlobals: ["excluded-global"],
    };
    injectAuditHooks(mockConfig, options);

    const targetGlobal = mockConfig.globals?.find((g) => g.slug === "excluded-global");
    expect(targetGlobal).toBeDefined();
    expect(targetGlobal?.hooks?.afterChange).toBeUndefined();
    expect(targetGlobal?.hooks?.afterRead).toBeUndefined();
  });

  it("should handle undefined collections array gracefully", () => {
    const options = { ...defaultTestOptions };
    const configWithoutCollections: Config = {
      ...mockConfig,
      collections: undefined, // explicitly undefined
    };
    // expect no error and collections to be initialized
    expect(() => injectAuditHooks(configWithoutCollections, options)).not.toThrow();
    expect(configWithoutCollections.collections).toStrictEqual([]);
  });

  it("should handle undefined globals array gracefully", () => {
    const options = { ...defaultTestOptions };
    const configWithoutGlobals: Config = {
      ...mockConfig,
      globals: undefined, // explicitly undefined
    };
    // expect no error and globals to be initialized
    expect(() => injectAuditHooks(configWithoutGlobals, options)).not.toThrow();
    expect(configWithoutGlobals.globals).toStrictEqual([]);
  });

  it("should still add hooks structure even if plugin or specific operations are disabled", () => {
    const options: HookOptions = {
      ...defaultTestOptions,
      disabled: true,
      operations: {
        create: false,
        delete: false,
        read: false,
        update: false,
      },
    };
    injectAuditHooks(mockConfig, options);

    // hooks should still be added; the logger function inside them checks the options
    const targetCollection = mockConfig.collections?.find((c) => c.slug === "posts");
    expect(targetCollection?.hooks?.afterChange).toHaveLength(2); // existing + injected hook
    expect(targetCollection?.hooks?.afterDelete).toHaveLength(1);
    expect(targetCollection?.hooks?.afterRead).toHaveLength(1);

    const targetGlobal = mockConfig.globals?.find((g) => g.slug === "settings");
    expect(targetGlobal?.hooks?.afterChange).toHaveLength(2); // existing + injected hook
    expect(targetGlobal?.hooks?.afterRead).toHaveLength(1);
  });
});
