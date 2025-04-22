import type { JsonObject, Operation, PayloadRequest, TypeWithID, TypeWithVersion } from "payload";

import type { PayloadSentinelConfig } from "./config.js";

type LogOptions = Required<Pick<PayloadSentinelConfig, "auditLogCollection" | "disabled" | "operations">>;

/**
 * Logs an audit entry for a collection operation.
 *
 * @param {LogOptions} options - The logging options.
 * @param {Object} params - Parameters for the audit log.
 * @param {string} params.collectionSlug - The slug of the collection.
 * @param {Record<string, unknown> & TypeWithID} params.doc - The document involved in the operation.
 * @param {Operation} params.operation - The operation performed (create, update, delete, read).
 * @param {PayloadRequest} params.req - The Payload request context.
 * @returns {Promise<void>} Resolves when the audit log is created or skipped.
 * @throws {Error} Throws if unable to retrieve versions or create audit log.
 * Note: Errors thrown during version retrieval are not caused by versioning being disabled.
 * If versioning is disabled, the retrieval simply returns empty results without error.
 * Any thrown error indicates a different underlying issue.
 */
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
): Promise<void> {
  if (options.disabled || !options.operations[operation] || !req.user?.id) {
    return;
  }
  // fetch previous version if exists / if versioning is enabled
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
    // if versioning is disabled or prev version does not exist, totalDocs would be 0
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
      collection: options.auditLogCollection,
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

/**
 * Logs an audit entry for a global operation.
 *
 * @param {LogOptions} options - The logging options.
 * @param {Object} params - Parameters for the audit log.
 * @param {string} params.globalSlug - The slug of the global.
 * @param {Operation} params.operation - The operation performed (update, read).
 * @param {PayloadRequest} params.req - The Payload request context.
 * @returns {Promise<void>} Resolves when the audit log is created or skipped.
 * @throws {Error} Throws if unable to retrieve versions or create audit log.
 * Note: Errors thrown during version retrieval are not caused by versioning being disabled.
 * If versioning is disabled, the retrieval simply returns empty results without error.
 * Any thrown error indicates a different underlying issue.
 */
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
): Promise<void> {
  if (options.disabled || !options.operations[operation] || !req.user?.id) {
    return;
  }
  // fetch previous version if exists / if versioning is enabled
  let previousVersion: TypeWithVersion<JsonObject> | undefined;
  try {
    const latestVersions = await req.payload.findGlobalVersions({
      slug: globalSlug,
      limit: 1,
      sort: "-updatedAt",
    });
    // if versioning is disabled or prev version does not exist, totalDocs would be 0
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
      collection: options.auditLogCollection,
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
