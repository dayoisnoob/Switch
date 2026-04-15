import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  real,
  index,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { boardsTable } from './boards.schema';
import { columnsTable } from './columns.schema';
import { usersTable } from './users.schema';

export const priorityEnum = pgEnum('priority', [
  'none',
  'low',
  'medium',
  'high',
  'urgent',
]);

export const tasksTable = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    columnId: uuid('column_id')
      .notNull()
      .references(() => columnsTable.id, { onDelete: 'cascade' }),
    boardId: uuid('board_id')
      .notNull()
      .references(() => boardsTable.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    priority: priorityEnum('priority').notNull().default('none'),
    dueDate: timestamp('due_date'),
    coverImageUrl: text('cover_image_url'),
    order: real('order').notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => usersTable.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('cards_board_id_idx').on(t.boardId),
    index('cards_column_id_idx').on(t.columnId),
  ]
);

export const taskAssigneesTable = pgTable(
  'task_assignees',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    taskId: uuid('card_id')
      .notNull()
      .references(() => tasksTable.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (t) => [
    uniqueIndex('ca_card_user_idx').on(t.taskId, t.userId),
    index('ca_card_id_idx').on(t.taskId),
  ]
);
