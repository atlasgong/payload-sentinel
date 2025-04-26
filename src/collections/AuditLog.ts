import type { CollectionConfig } from "payload";

import type { PayloadSentinelConfig } from "../config.js";

type AuditLogCollectionOptions = Required<Pick<PayloadSentinelConfig, "auditLogCollection" | "authCollection">>;

export const AuditLog = ({
  auditLogCollection: auditLogCollection,
  authCollection,
}: AuditLogCollectionOptions): CollectionConfig => ({
  slug: auditLogCollection,
  access: {
    create: () => false,
    delete: () => false,
    update: () => false,
  },
  admin: {
    defaultColumns: ["timestamp", "operation", "resourceURL", "previousVersionId", "user"],
    disableCopyToLocale: true,
    useAsTitle: "timestamp",
  },
  fields: [
    {
      name: "timestamp",
      type: "date",
      admin: {
        date: { displayFormat: "yyyy-MM-dd HH:mm:ss" },
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
      name: "resourceURL",
      type: "text",
      admin: {
        components: {
          Cell: "payload-sentinel/rsc#ResourceURLCell",
        },
        readOnly: true,
      },
      label: "Resource URL",
      required: true,
    },
    {
      name: "documentId",
      type: "text",
      admin: { readOnly: true },
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
      required: false,
    },
  ],
  labels: {
    plural: "Audit Log",
    singular: "Audit Log",
  },
});
