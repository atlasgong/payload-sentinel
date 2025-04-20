import type { Config, JsonObject, Operation, PayloadRequest, TypeWithID, TypeWithVersion } from "payload";

import type { PayloadSentinelConfig } from "./config.js";

import { defaultConfig } from "./defaults.js";

export const payloadSentinel =
  (pluginOptions: PayloadSentinelConfig = {}) =>
  (config: Config): Config => {
    // merge options: shallow merge for top-level, explicit merge for nested 'operations'
    const options = {
      ...defaultConfig,
      ...pluginOptions,
      operations: {
        ...defaultConfig.operations,
        ...(pluginOptions.operations || {}),
      },
    };

    async function logCollectionAudit({
      collectionSlug,
      doc,
      operation,
      req,
    }: {
      collectionSlug: string;
      doc: Record<string, unknown>;
      operation: Operation;
      req: PayloadRequest;
    }) {
      if (options.disabled || !options.operations[operation] || !req.user?.id) {
        return;
      }
      let previousVersion: TypeWithVersion<JsonObject & TypeWithID> | undefined;
      try {
        const latestVersions = await req.payload.findVersions({
          collection: collectionSlug,
          limit: 1,
          sort: "-updatedAt",
          where: {
            parent: {
              equals: doc.id,
            },
          },
        });
        previousVersion = latestVersions.totalDocs > 0 ? latestVersions.docs[0] : undefined;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          "System error: unable to retrieve versions. This is not because versioning is disabled or missing for this document. Details: " +
            message,
        );
      }
      try {
        await req.payload.create({
          collection: options.auditLogsCollection,
          data: {
            documentId: doc.id,
            operation,
            previousVersionId: previousVersion?.id,
            resourceType: collectionSlug,
            timestamp: new Date(),
            user: req.user?.id,
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error("Error creating audit log: " + message);
      }
    }

    async function logGlobalAudit({
      globalSlug,
      operation,
      req,
    }: {
      globalSlug: string;
      operation: Operation;
      req: PayloadRequest;
    }) {
      if (options.disabled || !options.operations[operation] || !req.user?.id) {
        return;
      }
      let previousVersion: TypeWithVersion<JsonObject> | undefined;
      try {
        const latestVersions = await req.payload.findGlobalVersions({
          slug: globalSlug,
          limit: 1,
          sort: "-updatedAt",
        });
        previousVersion = latestVersions.totalDocs > 0 ? latestVersions.docs[0] : undefined;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(
          "System error: unable to retrieve versions. This is not because versioning is disabled or missing for this document. Details: " +
            message,
        );
      }
      try {
        await req.payload.create({
          collection: options.auditLogsCollection,
          data: {
            documentId: globalSlug,
            operation,
            previousVersionId: previousVersion?.id,
            resourceType: globalSlug,
            timestamp: new Date(),
            user: req.user?.id,
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error("Error creating audit log: " + message);
      }
    }

    if (!config.collections) {
      config.collections = [];
    }
    if (!config.globals) {
      config.globals = [];
    }

    // create the audit logs collection
    config.collections.push({
      slug: options.auditLogsCollection,
      access: {
        create: () => false,
        delete: () => false,
        update: () => false,
      },
      admin: {
        defaultColumns: ["timestamp", "operation", "resourceType", "documentId", "previousVersionId", "user"],
        disableCopyToLocale: true,
        useAsTitle: "timestamp",
      },
      fields: [
        {
          name: "timestamp",
          type: "date",
          admin: {
            date: { displayFormat: "yyyy-MM-dd HH:mm:ss.SSS" },
            readOnly: true,
          },
          required: true,
        },
        {
          name: "operation",
          type: "select",
          admin: { readOnly: true },
          options: ["create", "read", "update", "delete"],
          required: true,
        },
        {
          name: "resourceType",
          type: "text",
          admin: { readOnly: true },
          required: true,
        },
        {
          name: "documentId",
          type: "text",
          admin: {
            components: {
              Cell: "payload-sentinel/rsc#DocumentIDCell",
            },
            readOnly: true,
          },
          label: "Document ID",
          required: true,
        },
        {
          name: "previousVersionId",
          type: "text",
          admin: {
            components: {
              Cell: "payload-sentinel/rsc#PreviousVersionIDCell",
            },
            readOnly: true,
          },
          label: "Previous Version ID",
          required: false,
        },
        {
          name: "user",
          type: "relationship",
          admin: { readOnly: true },
          relationTo: options.authCollection,
          required: true,
        },
      ],
      labels: {
        plural: "Audit Log",
        singular: "Audit Log",
      },
    });

    // add hooks to all collections that aren't explicitly excluded
    for (const collection of config.collections) {
      if (options.excludedCollections?.includes(collection.slug)) {
        continue;
      }

      collection.hooks = {
        ...collection.hooks,
        afterChange: [
          async ({ doc, operation, req }) => {
            await logCollectionAudit({
              collectionSlug: collection.slug,
              doc,
              operation,
              req,
            });
          },
          ...(collection.hooks?.afterChange || []),
        ],
        afterDelete: [
          async ({ doc, req }) => {
            await logCollectionAudit({
              collectionSlug: collection.slug,
              doc,
              operation: "delete",
              req,
            });
          },
          ...(collection.hooks?.afterDelete || []),
        ],
        afterRead: [
          async ({ doc, req }) => {
            await logCollectionAudit({
              collectionSlug: collection.slug,
              doc,
              operation: "read",
              req,
            });
          },
          ...(collection.hooks?.afterRead || []),
        ],
      };
    }

    // add hooks to all globals that aren't explicitly excluded
    for (const global of config.globals) {
      if (options.excludedGlobals?.includes(global.slug)) {
        continue;
      }

      global.hooks = {
        ...global.hooks,
        afterChange: [
          async ({ req }) => {
            // globals only trigger 'update' in afterChange
            await logGlobalAudit({
              globalSlug: global.slug,
              operation: "update",
              req,
            });
          },
          ...(global.hooks?.afterChange || []),
        ],
        afterRead: [
          async ({ req }) => {
            await logGlobalAudit({
              globalSlug: global.slug,
              operation: "read",
              req,
            });
          },
          ...(global.hooks?.afterRead || []),
        ],
      };
    }

    return config;
  };
