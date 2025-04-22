import type { CollectionAfterReadHook } from "payload";

import type { HookOptions } from "../injectHooks.js";

import { logCollectionAudit } from "../logger.js";

export const collectionAfterReadAuditHook = (options: HookOptions): CollectionAfterReadHook => {
  return async (args) => {
    if (!options.operations["read"]) {
      return args.doc;
    }

    await logCollectionAudit({
      auditLogCollection: options.auditLogCollection,
      collectionSlug: args.collection.slug,
      doc: args.doc,
      operation: "read",
      req: args.req,
    });

    return args.doc;
  };
};
