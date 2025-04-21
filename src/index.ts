import type { Config } from "payload";

import type { PayloadSentinelConfig } from "./config.js";

import { AuditLog } from "./collections/AuditLog.js";
import { defaultConfig } from "./defaults.js";
import { injectAuditHooks } from "./injectHooks.js";

export const payloadSentinel =
  (pluginOptions: PayloadSentinelConfig = {}) =>
  (config: Config): Config => {
    // merge options: shallow merge for top-level, explicit merge for nested 'operations'
    const options = {
      ...defaultConfig,
      ...pluginOptions,
      operations: {
        ...defaultConfig.operations,
        ...(pluginOptions.operations || {}),
      },
    };

    if (!config.collections) {
      config.collections = [];
    }
    if (!config.globals) {
      config.globals = [];
    }

    // create and inject the audit logs collection
    const auditLogCollection = AuditLog({
      auditLogsCollection: options.auditLogsCollection,
      authCollection: options.authCollection,
    });
    config.collections.push(auditLogCollection);

    // inject audit hooks into collections and globals
    injectAuditHooks(config, options);

    return config;
  };
