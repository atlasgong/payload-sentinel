import type { Config } from "payload";

import type { PayloadSentinelConfig } from "./config.js";

import { collectionAfterChangeAuditHook } from "./hooks/collectionAfterChangeAuditHook.js";
import { collectionAfterDeleteAuditHook } from "./hooks/collectionAfterDeleteAuditHook.js";
import { collectionAfterReadAuditHook } from "./hooks/collectionAfterReadAuditHook.js";
import { globalAfterChangeAuditHook } from "./hooks/globalAfterChangeAuditHook.js";
import { globalAfterReadAuditHook } from "./hooks/globalAfterReadAuditHook.js";

export type HookOptions = Required<
  Pick<
    PayloadSentinelConfig,
    "auditLogCollection" | "disabled" | "excludedCollections" | "excludedGlobals" | "operations"
  >
>;

/**
 * Injects audit hooks into the provided Payload config's collections and globals.
 * Hooks are added to collections and globals that are not excluded by options.
 *
 * @param {Config} config - The Payload configuration object to modify.
 * @param {HookOptions} options - The options controlling audit hook injection.
 * @returns {void}
 */
export const injectAuditHooks = (config: Config, options: HookOptions): void => {
  // ensure collections and globals arrays exist
  if (!config.collections) {
    config.collections = [];
  }
  if (!config.globals) {
    config.globals = [];
  }

  // add hooks to all collections that aren't explicitly excluded
  for (const collection of config.collections) {
    // skip excluded collections and the audit log collection itself
    if (options.excludedCollections?.includes(collection.slug) || collection.slug === options.auditLogCollection) {
      continue;
    }

    collection.hooks = {
      ...collection.hooks,
      afterChange: [...(collection.hooks?.afterChange || []), collectionAfterChangeAuditHook(options)],
      afterDelete: [...(collection.hooks?.afterDelete || []), collectionAfterDeleteAuditHook(options)],
      afterRead: [...(collection.hooks?.afterRead || []), collectionAfterReadAuditHook(options)],
    };
  }

  // add hooks to all globals that aren't explicitly excluded
  for (const global of config.globals) {
    if (options.excludedGlobals?.includes(global.slug)) {
      continue;
    }

    global.hooks = {
      ...global.hooks,
      afterChange: [...(global.hooks?.afterChange || []), globalAfterChangeAuditHook(options)],
      afterRead: [...(global.hooks?.afterRead || []), globalAfterReadAuditHook(options)],
    };
  }
};
