import type { CollectionAfterReadHook } from "payload";

import type { HookOptions } from "../injectHooks.js";

import { logCollectionAudit } from "../logger.js";

export const collectionAfterReadAuditHook = (options: HookOptions): CollectionAfterReadHook => {
  return async (args) => {
    if (!options.operations["read"] || !args.doc.id || args.findMany) {
      return args.doc;
    }

    try {
      await logCollectionAudit(args, {
        auditLogCollection: options.auditLogCollection,
        operation: "read",
      });
    } catch (error) {
      args.req.payload.logger.error(`Error on collectionAfterReadAuditHook: ${error}`);
    }

    return args.doc;
  };
};
