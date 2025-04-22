import type { GlobalAfterChangeHook } from "payload";

import type { HookOptions } from "../injectHooks.js";

import { logGlobalAudit } from "../logger.js";

export const globalAfterChangeAuditHook = (options: HookOptions): GlobalAfterChangeHook => {
  return async (args) => {
    if (!options.operations["update"]) {
      return args.doc;
    }

    await logGlobalAudit({
      auditLogCollection: options.auditLogCollection,
      globalSlug: args.global.slug,
      operation: "update",
      req: args.req,
    });

    return args.doc;
  };
};
