import type { Access, CollectionSlug, GlobalSlug } from "payload";

export type CRUDOperations = {
  /**
   * Enable logging for create operations.
   * @default true
   */
  create?: boolean;

  /**
   * Enable logging for delete operations.
   * @default true
   */
  delete?: boolean;

  /**
   * Enable logging for read operations.
   * @default false
   */
  read?: boolean;

  /**
   * Enable logging for update operations.
   * @default true
   */
  update?: boolean;
};

export type PayloadSentinelConfig = {
  /**
   * Read access for the audit log.
   * Note: create, update, and delete access cannot be configured and are all denied.
   * @default '({ req: { user } }) => { return Boolean(user)}'
   */
  access?: Access;

  /**
   * The slug for the audit log collection.
   * @default 'audit-log'
   */
  auditLogCollection?: string;

  /**
   * The group for the audit log collection.
   * @default 'Payload Sentinal'
   */
  auditLogCollectionGroup?: string;

  /**
   * The collection slug for authentication/users.
   * This collection will be used to associate audit log entries with users.
   * @default 'users'
   */
  authCollection?: CollectionSlug;

  /**
   * Represents the date format in which audit log timestamps should be displayed.
   * Accepts any valid unicode date format: https://date-fns.org/v4.1.0/docs/format
   */
  dateFormat?: string;

  /**
   * Whether to disable the audit logging functionality.
   * @default false
   */
  disabled?: boolean;

  /**
   * List of collections to exclude from audit logging.
   * By default, all collections will be logged except those specified here.
   * @example ['posts', 'media']
   */
  excludedCollections?: CollectionSlug[];

  /**
   * List of globals to exclude from audit logging.
   * By default, all globals will be logged except those specified here.
   * @example ['settings']
   */
  excludedGlobals?: GlobalSlug[];

  /**
   * Configure which CRUD operations to log.
   * By default, creates, updates, and deletes are logged.
   */
  operations?: CRUDOperations;
};
