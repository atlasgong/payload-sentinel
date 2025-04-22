import type { CollectionAfterDeleteHook } from "payload";

import type { HookOptions } from "../injectHooks.js";

import { logCollectionAudit } from "../logger.js";

export const collectionAfterDeleteAuditHook = (options: HookOptions): CollectionAfterDeleteHook => {
  return async (args) => {
    if (!options.operations["delete"]) {
      return args.doc;
    }

    await logCollectionAudit({
      auditLogCollection: options.auditLogCollection,
      collectionSlug: args.collection.slug,
      doc: args.doc,
      operation: "delete",
      req: args.req,
    });

    return args.doc;
  };
};
