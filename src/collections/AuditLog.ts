import type { CollectionConfig } from "payload";

import type { PayloadSentinelConfig } from "../config.js";

type AuditLogCollectionOptions = Required<
  Pick<PayloadSentinelConfig, "access" | "auditLogCollection" | "auditLogCollectionGroup" | "authCollection" | "dateFormat">
>;

export const AuditLog = ({
  access,
  auditLogCollection,
  auditLogCollectionGroup,
  authCollection,
  dateFormat,
}: AuditLogCollectionOptions): CollectionConfig => ({
  slug: auditLogCollection,
  access: {
    create: () => false,
    delete: () => false,
    read: access,
    update: () => false,
  },
  admin: {
    defaultColumns: ["createdAt", "operation", "resourceURL", "previousVersionId", "user"],
    disableCopyToLocale: true,
    group: auditLogCollectionGroup,
    useAsTitle: "createdAt",
  },
  fields: [
    {
      name: "createdAt",
      type: "date",
      admin: {
        date: { displayFormat: dateFormat },
        readOnly: true,
      },
      required: true,
    },
    {
      name: "operation",
      type: "select",
      admin: {
        components: {
          Cell: "payload-sentinel/rsc#OperationCell",
        },
        readOnly: true,
      },
      options: ["create", "read", "update", "delete"],
      required: true,
    },
    {
      name: "resourceURL",
      type: "text",
      admin: {
        components: { Cell: "payload-sentinel/rsc#ResourceURLCell" },
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
        components: { Cell: "payload-sentinel/rsc#PreviousVersionIDCell" },
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
