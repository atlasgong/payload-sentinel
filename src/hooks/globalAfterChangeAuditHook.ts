import type { GlobalAfterChangeHook } from "payload";

import type { HookOptions } from "../injectHooks.js";

import { logGlobalAudit } from "../logger.js";

export const globalAfterChangeAuditHook = (options: HookOptions): GlobalAfterChangeHook => {
  return async (args) => {
    if (!options.operations["update"]) {
      return args.doc;
    }

    try {
      await logGlobalAudit(args, {
        auditLogCollection: options.auditLogCollection,
        operation: "update",
      });
    } catch (error) {
      args.req.payload.logger.error(`Error on globalAfterChangeAuditHook: ${error}`);
    }

    return args.doc;
  };
};
