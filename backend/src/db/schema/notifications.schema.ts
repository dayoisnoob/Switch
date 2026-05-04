import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';

export const notificationTypeEnum = pgEnum('notification_type', [
  'card_assigned',
  'card_unassigned',
  'card_due_soon',
  'comment_added',
  'mentioned',
]);

export const notificationsTable = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    body: text('body').notNull(),
    entityId: uuid('entity_id'),
    entityType: varchar('entity_type', { length: 50 }),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('notifications_user_id_idx').on(t.userId),
    index('notifications_is_read_idx').on(t.isRead),
  ]
);
