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
      access: options.access,
      auditLogCollection: options.auditLogCollection,
      auditLogCollectionGroup: options.auditLogCollectionGroup,
      authCollection: options.authCollection,
      dateFormat: options.dateFormat,
    });
    config.collections.push(auditLogCollection);

    // inject audit hooks into collections and globals
    injectAuditHooks(config, options);

    // warn that the READ hook is under development
    if (options.operations.read) {
      console.warn(
        "You have enabled logging for Payload Sentinel's read operation.\n" +
          "This feature is still under heavy development and you should expect to encounter many bugs.\n" +
          "Report bugs here: https://github.com/atlasgong/payload-sentinel/issues\n",
      );
    }

    return config;
  };
