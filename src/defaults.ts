import type { CRUDOperations, PayloadSentinelConfig } from "./config.js";

export const defaultCRUDOperations: CRUDOperations = {
  create: true,
  delete: true,
  read: false,
  update: true,
};

export const defaultConfig: Required<PayloadSentinelConfig> = {
  access: ({ req: { user } }) => {
    return Boolean(user);
  },
  auditLogCollection: "audit-log",
  auditLogCollectionGroup: "Payload Sentinel",
  authCollection: "users",
  dateFormat: "EEE, dd MMM yyyy HH:mm:ss",
  disabled: false,
  excludedCollections: [],
  excludedGlobals: [],
  operations: defaultCRUDOperations,
};
