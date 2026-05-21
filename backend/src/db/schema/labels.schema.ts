import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { workspacesTable } from './workspaces.schema';
import { cardsTable } from './cards.schema';

export const labelsTable = pgTable(
  'labels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspacesTable.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 50 }).notNull(),
    colour: varchar('colour', { length: 7 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('labels_workspace_id_idx').on(t.workspaceId),
    uniqueIndex('labels_workspace_name_idx').on(t.workspaceId, t.name),
  ]
);

export const cardLabelsTable = pgTable(
  'card_labels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cardId: uuid('card_id')
      .notNull()
      .references(() => cardsTable.id, { onDelete: 'cascade' }),
    labelId: uuid('label_id')
      .notNull()
      .references(() => labelsTable.id, { onDelete: 'cascade' }),
  },
  (t) => [
    uniqueIndex('cl_card_label_idx').on(t.cardId, t.labelId),
    index('cl_card_id_idx').on(t.cardId),
  ]
);
