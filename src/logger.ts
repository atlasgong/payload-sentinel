import type {
  JsonObject,
  Operation,
  PayloadRequest,
  RequestContext,
  SanitizedCollectionConfig,
  SanitizedGlobalConfig,
  TypeWithID,
  TypeWithVersion,
} from "payload";

interface CollectionAfterOperationHookArgs {
  collection: SanitizedCollectionConfig;
  context: RequestContext;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any;
  req: PayloadRequest;
}

interface GlobalAfterOperationHookArgs {
  context: RequestContext;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any;
  global: SanitizedGlobalConfig;
  req: PayloadRequest;
}

interface CollectionLogInformationParams {
  /**
   * The slug for the Audit Log collection.
   */
  auditLogCollection: string;
  /**
   * The operation performed (create, update, delete, read).
   */
  operation: Operation;
}

interface GlobalLogInformationParams {
  /**
   * The slug for the Audit Log collection.
   */
  auditLogCollection: string;
  /**
   * The operation performed (update, read).
   */
  operation: Operation;
}

/**
 * Logs an audit entry for a collection operation.
 *
 * @param {CollectionAfterOperationHookArgs} args - Args from Payload's collection operation hook.
 * @param {CollectionLogInformationParams} params - Data for the audit log.
 * @returns {Promise<void>} Resolves when the audit log is created or skipped.
 * @throws {Error} Throws if unable to create audit log.
 */
export async function logCollectionAudit(
  args: CollectionAfterOperationHookArgs,
  params: CollectionLogInformationParams,
): Promise<void> {
  // fetch previous version if exists / if versioning is enabled
  let previousVersion: TypeWithVersion<JsonObject & TypeWithID> | undefined;
  if (args.collection.versions) {
    try {
      const latestVersions = await args.req.payload.findVersions({
        collection: args.collection.slug,
        limit: 1,
        sort: "-updatedAt",
        where: {
          parent: {
            equals: args.doc.id,
          },
        },
      });
      // if prev version does not exist, totalDocs would be 0
      if (latestVersions) {
        previousVersion = latestVersions.totalDocs > 0 ? latestVersions.docs[0] : undefined;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      args.req.payload.logger.error(
        "System error: unable to retrieve versions. Operation will still be logged. Details: " + message,
      );
    }
  }

  try {
    await args.req.payload.create({
      collection: params.auditLogCollection,
      data: {
        documentId: String(args.doc.id),
        operation: params.operation,
        previousVersionId: previousVersion?.id,
        resourceURL: "collections/" + args.collection.slug + "/" + String(args.doc.id),
        timestamp: new Date(),
        user: args.req.user?.id,
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
 * @param {GlobalAfterOperationHookArgs} args - Args from Payload's global operation hook.
 * @param {GlobalLogInformationParams} params - Data for the audit log.
 * @returns {Promise<void>} Resolves when the audit log is created or skipped.
 * @throws {Error} Throws if unable to create audit log.
 */
export async function logGlobalAudit(
  args: GlobalAfterOperationHookArgs,
  params: GlobalLogInformationParams,
): Promise<void> {
  // fetch previous version if exists / if versioning is enabled
  let previousVersion: TypeWithVersion<JsonObject> | undefined;
  if (args.global.versions) {
    try {
      const latestVersions = await args.req.payload.findGlobalVersions({
        slug: args.global.slug,
        limit: 1,
        sort: "-updatedAt",
      });
      // if prev version does not exist, totalDocs would be 0
      if (latestVersions) {
        previousVersion = latestVersions.totalDocs > 0 ? latestVersions.docs[0] : undefined;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      args.req.payload.logger.error(
        "System error: unable to retrieve versions. Operation will still be logged. Details: " + message,
      );
    }
  }
  try {
    await args.req.payload.create({
      collection: params.auditLogCollection,
      data: {
        documentId: args.global.slug,
        operation: params.operation,
        previousVersionId: previousVersion?.id,
        resourceURL: "globals/" + args.global.slug,
        timestamp: new Date(),
        user: args.req.user?.id,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error("Error creating audit log: " + message);
  }
}
