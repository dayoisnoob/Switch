import type { InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const usersTable = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 100 }).notNull().unique(),

    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    role: userRoleEnum('role').notNull().default('user'),

    avatarUrl: text('avatar_url'),

    authProvider: varchar('auth_provider', { length: 50 }),
    providerId: varchar('provider_id', { length: 255 }),

    passwordHash: text('password_hash'),
    emailVerified: boolean('email_verified').default(false),
    hasRegistered: boolean('has_registered').notNull().default(false),

    isActive: boolean('is_active').default(true).notNull(),
    lastLogin: timestamp('last_login'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (t) => [
    index('idx_email').on(t.email),
    uniqueIndex('users_provider_idx').on(t.authProvider, t.providerId),
  ]
);
//circle back to unique index on nullable column
