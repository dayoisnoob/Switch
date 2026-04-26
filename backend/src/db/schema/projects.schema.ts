import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { workspacesTable } from './workspaces.schema';

export const projectsTable = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull(),
    description: text('description'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => usersTable.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('projects_workspace_id_idx').on(t.workspaceId),
    uniqueIndex('projects_workspace_id_slug_idx').on(t.workspaceId, t.slug),
  ]
);
