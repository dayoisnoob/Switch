import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';
import { projectsTable } from './projects.schema';

export const boardsTable = pgTable('boards', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .unique()
    .references(() => projectsTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
