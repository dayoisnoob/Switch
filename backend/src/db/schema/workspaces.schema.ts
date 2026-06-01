import type { InferSelectModel } from 'drizzle-orm';
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { workspaceRoleEnum } from './enums.schema';
import { usersTable } from './users.schema';

export const workspacesTable = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  colour: text('colour').default('bg-[#8B5CF6]'),
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
    role: workspaceRoleEnum('role').notNull().default('Member'),
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
    role: workspaceRoleEnum('role').notNull().default('Member'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('wi_workspace_id_idx').on(t.workspaceId),
    uniqueIndex('wi_workspace_email_idx').on(t.workspaceId, t.email),
  ]
);

export type WorkspaceMember = InferSelectModel<
  typeof workspaceMembershipsTable
>;
