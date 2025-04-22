import type { GlobalAfterReadHook } from "payload";

import type { HookOptions } from "../injectHooks.js";

import { logGlobalAudit } from "../logger.js";

export const globalAfterReadAuditHook = (options: HookOptions): GlobalAfterReadHook => {
  return async (args) => {
    if (!options.operations["read"]) {
      return args.doc;
    }

    await logGlobalAudit({
      auditLogCollection: options.auditLogCollection,
      globalSlug: args.global.slug,
      operation: "read",
      req: args.req,
    });

    return args.doc;
  };
};
