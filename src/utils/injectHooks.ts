import type { Config, TypeWithID } from "payload";

import type { PayloadSentinelConfig } from "../config.js";

import { logCollectionAudit, logGlobalAudit } from "./log.js";

// Define a type for the options needed by the hook injection
type HookOptions = Required<
  Pick<
    PayloadSentinelConfig,
    "auditLogsCollection" | "disabled" | "excludedCollections" | "excludedGlobals" | "operations"
  >
>;

export const injectAuditHooks = (config: Config, options: HookOptions): void => {
  // ensure collections and globals arrays exist
  if (!config.collections) {
    config.collections = [];
  }
  if (!config.globals) {
    config.globals = [];
  }

  // add hooks to all collections that aren't explicitly excluded
  for (const collection of config.collections) {
    // skip excluded collections and the audit log collection itself
    if (options.excludedCollections?.includes(collection.slug) || collection.slug === options.auditLogsCollection) {
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
};
