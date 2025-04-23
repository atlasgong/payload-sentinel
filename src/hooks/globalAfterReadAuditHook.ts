import type { GlobalAfterReadHook } from "payload";

import type { HookOptions } from "../injectHooks.js";

import { logGlobalAudit } from "../logger.js";

export const globalAfterReadAuditHook = (options: HookOptions): GlobalAfterReadHook => {
  return async (args) => {
    if (!options.operations["read"]) {
      return args.doc;
    }

    try {
      await logGlobalAudit(args, {
        auditLogCollection: options.auditLogCollection,
        operation: "read",
      });
    } catch (error) {
      args.req.payload.logger.error(`Error on globalAfterReadAuditHook: ${error}`);
    }

    return args.doc;
  };
};
