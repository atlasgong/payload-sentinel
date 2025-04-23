import type { CollectionAfterChangeHook } from "payload";

import type { HookOptions } from "../injectHooks.js";

import { logCollectionAudit } from "../logger.js";

export const collectionAfterChangeAuditHook = (options: HookOptions): CollectionAfterChangeHook => {
  return async (args) => {
    if (!options.operations[args.operation]) {
      return args.doc;
    }

    try {
      await logCollectionAudit(args, {
        auditLogCollection: options.auditLogCollection,
        operation: args.operation,
      });
    } catch (error) {
      args.req.payload.logger.error(`Error on collectionAfterChangeAuditHook: ${error}`);
    }

    return args.doc;
  };
};
