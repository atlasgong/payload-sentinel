import type { CRUDOperations, PayloadSentinelConfig } from "./config.js";

export const defaultCRUDOperations: CRUDOperations = {
  create: true,
  delete: true,
  read: false,
  update: true,
};

export const defaultConfig: Required<PayloadSentinelConfig> = {
  auditLogsCollection: "audit-logs",
  authCollection: "users",
  disabled: false,
  excludedCollections: {},
  operations: defaultCRUDOperations,
};
