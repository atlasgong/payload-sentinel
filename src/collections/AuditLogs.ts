import type { CollectionConfig } from "payload";

import type { PayloadSentinelConfig } from "../config.js";

type AuditLogsCollectionOptions = Required<Pick<PayloadSentinelConfig, "auditLogsCollection" | "authCollection">>;

export const createAuditLogsCollection = ({
  auditLogsCollection,
  authCollection,
}: AuditLogsCollectionOptions): CollectionConfig => ({
  slug: auditLogsCollection,
  access: {
    create: () => false,
    delete: () => false,
    update: () => false,
  },
  admin: {
    defaultColumns: ["timestamp", "operation", "resourceType", "documentId", "previousVersionId", "user"],
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
      admin: {
        components: {
          Cell: "payload-sentinel/rsc#DocumentIDCell",
        },
        readOnly: true,
      },
      label: "Document ID",
      required: true,
    },
    {
      name: "previousVersionId",
      type: "text",
      admin: {
        components: {
          Cell: "payload-sentinel/rsc#PreviousVersionIDCell",
        },
        readOnly: true,
      },
      label: "Previous Version ID",
      required: false,
    },
    {
      name: "user",
      type: "relationship",
      admin: { readOnly: true },
      relationTo: authCollection,
      required: true,
    },
  ],
  labels: {
    plural: "Audit Log",
    singular: "Audit Log",
  },
});
