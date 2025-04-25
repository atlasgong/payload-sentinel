import type { CollectionAfterDeleteHook } from "payload";

import type { HookOptions } from "../injectHooks.js";

import { logCollectionAudit } from "../logger.js";

export const collectionAfterDeleteAuditHook = (options: HookOptions): CollectionAfterDeleteHook => {
  return async (args) => {
    if (!options.operations["delete"]) {
      return args.doc;
    }

    try {
      await logCollectionAudit(args, {
        auditLogCollection: options.auditLogCollection,
        operation: "delete",
      });
    } catch (error) {
      args.req.payload.logger.error(`Error on collectionAfterDeleteAuditHook: ${error}`);
    }

    return args.doc;
  };
};
