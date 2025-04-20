import type { Config, TypeWithID } from "payload";

import type { PayloadSentinelConfig } from "./config.js";

import { logCollectionAudit, logGlobalAudit } from "./audit/log.js";
import { createAuditLogsCollection } from "./collections/AuditLogs.js";
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

    if (!config.collections) {
      config.collections = [];
    }
    if (!config.globals) {
      config.globals = [];
    }

    // create and inject the audit logs collection
    const auditLogCollection = createAuditLogsCollection({
      auditLogsCollection: options.auditLogsCollection,
      authCollection: options.authCollection,
    });
    config.collections.push(auditLogCollection);

    // add hooks to all collections that aren't explicitly excluded
    for (const collection of config.collections) {
      if (options.excludedCollections?.includes(collection.slug)) {
        continue;
      }

      collection.hooks = {
        ...collection.hooks,
        afterChange: [
          async ({ doc, operation, req }) => {
            // ensure doc has a valid ID before passing
            if (doc && typeof doc === "object" && "id" in doc && typeof doc.id === "string") {
              await logCollectionAudit(options, {
                collectionSlug: collection.slug,
                doc: doc as Record<string, unknown> & TypeWithID, // cast after check
                operation,
                req,
              });
            } else {
              throw new Error(
                `Audit log creation failed for collection ${collection.slug} (afterChange): Document or document ID is missing or invalid.`,
              );
            }
          },
          ...(collection.hooks?.afterChange || []),
        ],
        afterDelete: [
          async ({ doc, req }) => {
            // ensure doc has a valid ID before passing
            if (doc && typeof doc === "object" && "id" in doc && typeof doc.id === "string") {
              await logCollectionAudit(options, {
                collectionSlug: collection.slug,
                doc: doc as Record<string, unknown> & TypeWithID, // cast after check
                operation: "delete",
                req,
              });
            } else {
              throw new Error(
                `Audit log creation failed for collection ${collection.slug} (afterDelete): Document or document ID is missing or invalid.`,
              );
            }
          },
          ...(collection.hooks?.afterDelete || []),
        ],
        afterRead: [
          async ({ doc, req }) => {
            // ensure doc has a valid ID before passing
            if (doc && typeof doc === "object" && "id" in doc && typeof doc.id === "string") {
              await logCollectionAudit(options, {
                collectionSlug: collection.slug,
                doc: doc as Record<string, unknown> & TypeWithID, // cast after check
                operation: "read",
                req,
              });
            } else {
              // for afterRead, maybe skipping is better than throwing?
              throw new Error(
                `Audit log creation failed for collection ${collection.slug} (afterRead): Document or document ID is missing or invalid.`,
              );
            }
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
            await logGlobalAudit(options, {
              globalSlug: global.slug,
              operation: "update",
              req,
            });
          },
          ...(global.hooks?.afterChange || []),
        ],
        afterRead: [
          async ({ req }) => {
            await logGlobalAudit(options, {
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
