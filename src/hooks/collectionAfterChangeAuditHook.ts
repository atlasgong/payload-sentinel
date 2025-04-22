import type { CollectionAfterChangeHook } from "payload";

import type { HookOptions } from "../injectHooks.js";

import { logCollectionAudit } from "../logger.js";

export const collectionAfterChangeAuditHook = (options: HookOptions): CollectionAfterChangeHook => {
  return async (args) => {
    if (!options.operations[args.operation]) {
      return args.doc;
    }

    await logCollectionAudit({
      auditLogCollection: options.auditLogCollection,
      collectionSlug: args.collection.slug,
      doc: args.doc,
      operation: args.operation,
      req: args.req,
    });

    return args.doc;
  };
};
