import type { Config } from "payload";

import type { PayloadSentinelConfig } from "./config.js";

import { defaultConfig } from "./defaults.js";

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

    // create the audit logs collection
    config.collections.push({
      slug: options.auditLogsCollection,
      access: {
        create: () => false,
        delete: () => false,
        update: () => false,
      },
      admin: {
        defaultColumns: ["timestamp", "user", "operation", "resourceType", "documentId"],
        disableCopyToLocale: true,
        useAsTitle: "timestamp",
      },
      fields: [
        {
          name: "timestamp",
          type: "date",
          admin: {
            date: { displayFormat: "yyyy-MM-dd HH:mm:ss.SSS" },
            readOnly: true,
          },
          required: true,
        },
        {
          name: "user",
          type: "relationship",
          admin: { readOnly: true },
          relationTo: options.authCollection,
          required: true,
        },
        {
          name: "operation",
          type: "select",
          admin: { readOnly: true },
          options: ["create", "read", "update", "delete"],
          required: true,
        },
        {
          name: "resourceType",
          type: "text",
          admin: { readOnly: true },
          required: true,
        },
        {
          name: "documentId",
          type: "text",
          admin: { readOnly: true },
          label: "Document ID",
          required: true,
        },
      ],
      labels: {
        plural: "Audit Log",
        singular: "Audit Log",
      },
    });

    // add hooks to all collections that aren't explicitly excluded
    for (const collection of config.collections) {
      if (options.excludedCollections?.includes(collection.slug)) {
        continue;
      }

      collection.hooks = {
        ...collection.hooks,
        afterChange: [
          async ({ doc, operation, req }) => {
            // log only if plugin enabled, change operation enabled,and is user operation
            if (options.disabled || !options.operations[operation] || !req.user?.id) {
              return;
            }
            await req.payload.create({
              collection: options.auditLogsCollection,
              data: {
                documentId: doc.id,
                operation, // could be 'create' or 'update'
                resourceType: collection.slug,
                timestamp: new Date(),
                user: req.user?.id,
              },
            });
          },
          ...(collection.hooks?.afterChange || []),
        ],
        afterDelete: [
          async ({ doc, req }) => {
            // log only if plugin enabled, delete operation enabled, and is user operation
            if (options.disabled || !options.operations.delete || !req.user?.id) {
              return;
            }
            await req.payload.create({
              collection: options.auditLogsCollection,
              data: {
                documentId: doc.id,
                operation: "delete",
                resourceType: collection.slug,
                timestamp: new Date(),
                user: req.user?.id,
              },
            });
          },
          ...(collection.hooks?.afterDelete || []),
        ],
        afterRead: [
          async ({ doc, req }) => {
            // log only if plugin enabled, read operation enabled, and is user operation
            if (options.disabled || !options.operations.read || !req.user?.id) {
              return;
            }
            await req.payload.create({
              collection: options.auditLogsCollection,
              data: {
                documentId: doc.id,
                operation: "read",
                resourceType: collection.slug,
                timestamp: new Date(),
                user: req.user?.id,
              },
            });
          },
          ...(collection.hooks?.afterRead || []),
        ],
      };
    }

    // add hooks to all globals that aren't explicitly excluded
    for (const global of config.globals) {
      if (options.excludedGlobals?.includes(global.slug)) {
        continue;
      }

      global.hooks = {
        ...global.hooks,
        afterChange: [
          async ({ req }) => {
            // globals only trigger 'update' in afterChange
            // log only if plugin enabled, update operation enabled, and is user operation
            if (options.disabled || !options.operations.update || !req.user?.id) {
              return;
            }
            await req.payload.create({
              collection: options.auditLogsCollection,
              data: {
                documentId: global.slug,
                operation: "update",
                resourceType: global.slug,
                timestamp: new Date(),
                user: req.user?.id,
              },
            });
          },
          ...(global.hooks?.afterChange || []),
        ],
        afterRead: [
          async ({ req }) => {
            // log only if plugin enabled, read operation enabled, and is user operation
            if (options.disabled || !options.operations.read || !req.user?.id) {
              return;
            }
            await req.payload.create({
              collection: options.auditLogsCollection,
              data: {
                documentId: global.slug,
                operation: "read",
                resourceType: global.slug,
                timestamp: new Date(),
                user: req.user?.id,
              },
            });
          },
          ...(global.hooks?.afterRead || []),
        ],
      };
    }

    // add admin UI components only if plugin is enabled
    if (!options.disabled) {
      if (!config.admin) {
        config.admin = {};
      }
      if (!config.admin.components) {
        config.admin.components = {};
      }
      if (!config.admin.components.beforeDashboard) {
        config.admin.components.beforeDashboard = [];
      }

      // config.admin.components.beforeDashboard.push(`payload-sentinel/client#BeforeDashboardClient`);
      // config.admin.components.beforeDashboard.push(`payload-sentinel/rsc#BeforeDashboardServer`);
    }

    return config;
  };
