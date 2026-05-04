import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { otpPurposeEnum } from './enums.schema';

export const otpTable = pgTable('otps', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  hashedCode: varchar('hashed_code').notNull(),
  purpose: otpPurposeEnum('purpose').notNull(),

  expiresAt: timestamp('expires_at').notNull(),
  attempts: integer('attempts').notNull().default(0),
  isInvalidated: boolean('is_invalidated').notNull().default(false),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
