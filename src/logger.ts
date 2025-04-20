import type { JsonObject, Operation, PayloadRequest, TypeWithID, TypeWithVersion } from "payload";

import type { PayloadSentinelConfig } from "./config.js";

type LogOptions = Required<Pick<PayloadSentinelConfig, "auditLogsCollection" | "disabled" | "operations">>;

export async function logCollectionAudit(
  options: LogOptions,
  {
    collectionSlug,
    doc,
    operation,
    req,
  }: {
    collectionSlug: string;
    doc: Record<string, unknown> & TypeWithID;
    operation: Operation;
    req: PayloadRequest;
  },
) {
  if (options.disabled || !options.operations[operation] || !req.user?.id) {
    return;
  }
  let previousVersion: TypeWithVersion<JsonObject & TypeWithID> | undefined;
  try {
    const latestVersions = await req.payload.findVersions({
      collection: collectionSlug,
      limit: 1,
      sort: "-updatedAt",
      where: {
        parent: {
          equals: doc.id,
        },
      },
    });
    previousVersion = latestVersions.totalDocs > 0 ? latestVersions.docs[0] : undefined;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      "System error: unable to retrieve versions. This is not because versioning is disabled or missing for this document. Details: " +
        message,
    );
  }
  try {
    await req.payload.create({
      collection: options.auditLogsCollection,
      data: {
        documentId: doc.id,
        operation,
        previousVersionId: previousVersion?.id,
        resourceType: collectionSlug,
        timestamp: new Date(),
        user: req.user?.id,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error("Error creating audit log: " + message);
  }
}

export async function logGlobalAudit(
  options: LogOptions,
  {
    globalSlug,
    operation,
    req,
  }: {
    globalSlug: string;
    operation: Operation;
    req: PayloadRequest;
  },
) {
  if (options.disabled || !options.operations[operation] || !req.user?.id) {
    return;
  }
  let previousVersion: TypeWithVersion<JsonObject> | undefined;
  try {
    const latestVersions = await req.payload.findGlobalVersions({
      slug: globalSlug,
      limit: 1,
      sort: "-updatedAt",
    });
    previousVersion = latestVersions.totalDocs > 0 ? latestVersions.docs[0] : undefined;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      "System error: unable to retrieve versions. This is not because versioning is disabled or missing for this document. Details: " +
        message,
    );
  }
  try {
    await req.payload.create({
      collection: options.auditLogsCollection,
      data: {
        documentId: globalSlug,
        operation,
        previousVersionId: previousVersion?.id,
        resourceType: globalSlug,
        timestamp: new Date(),
        user: req.user?.id,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error("Error creating audit log: " + message);
  }
}
