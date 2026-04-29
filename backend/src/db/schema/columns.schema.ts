import {
  pgTable,
  uuid,
  varchar,
  real,
  timestamp,
  index,
  boolean,
} from 'drizzle-orm/pg-core';
import { boardsTable } from './boards.schema';

export const columnsTable = pgTable(
  'columns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    boardId: uuid('board_id')
      .notNull()
      .references(() => boardsTable.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    order: real('order').notNull(),
    isCompleted: boolean('is_completed').default(false).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('columns_board_id_idx').on(t.boardId)]
);
