import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { boardsTable } from './boards.schema';
import { columnsTable } from './columns.schema';
import { priorityEnum, statusEnum } from './enums.schema';
import { usersTable } from './users.schema';

export const cardsTable = pgTable(
  'cards',
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
    status: statusEnum('status').notNull().default('TODO'),
    priority: priorityEnum('priority').notNull().default('none'),
    dueDate: timestamp('due_date'),
    coverImageUrl: text('cover_image_url'),
    order: varchar('order').notNull(),
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
    index('cards_board_id_idx').on(t.boardId),
    index('cards_column_id_idx').on(t.columnId),
  ]
);

export const cardAssigneesTable = pgTable(
  'card_assignees',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cardId: uuid('card_id')
      .notNull()
      .references(() => cardsTable.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (t) => [
    uniqueIndex('ca_card_user_idx').on(t.cardId, t.userId),
    index('ca_card_id_idx').on(t.cardId),
  ]
);
