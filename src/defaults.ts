import type { CRUDOperations, PayloadSentinelConfig } from "./config.js";

export const defaultCRUDOperations: CRUDOperations = {
  create: true,
  delete: true,
  read: false,
  update: true,
};

export const defaultConfig: Required<PayloadSentinelConfig> = {
  auditLogCollection: "audit-log",
  authCollection: "users",
  disabled: false,
  excludedCollections: [],
  excludedGlobals: [],
  operations: defaultCRUDOperations,
};
