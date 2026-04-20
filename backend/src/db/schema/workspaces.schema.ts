import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  uniqueIndex,
  index,
  pgEnum,
  text,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import type { InferSelectModel } from 'drizzle-orm';

export const workspaceRoleEnum = pgEnum('workspace_role', [
  'owner',
  'admin',
  'member',
]);

export const workspacesTable = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => usersTable.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const workspaceMembershipsTable = pgTable(
  'workspace_memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    role: workspaceRoleEnum('role').notNull().default('member'),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('wm_workspace_user_idx').on(t.workspaceId, t.userId),
    index('wm_user_id_idx').on(t.userId),
  ]
);

export const workspaceInvitationsTable = pgTable(
  'workspace_invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
    invitedBy: uuid('invited_by')
      .notNull()
      .references(() => usersTable.id),
    email: varchar('email', { length: 255 }).notNull(),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    acceptedAt: timestamp('accepted_at'),
    role: workspaceRoleEnum('role').notNull().default('member'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('wi_workspace_id_idx').on(t.workspaceId)]
);

export type WorkspaceMember = InferSelectModel<
  typeof workspaceMembershipsTable
>;
