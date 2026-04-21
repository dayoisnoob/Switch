import {
  pgTable,
  uuid,
  jsonb,
  timestamp,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { cardsTable } from './cards.schema';
import { projectsTable } from './projects.schema';
import { usersTable } from './users.schema';

export const activityTypeEnum = pgEnum('activity_type', [
  'card_created',
  'card_updated',
  'card_moved',
  'card_deleted',
  'comment_added',
  'comment_edited',
  'comment_deleted',
  'assignee_added',
  'assignee_removed',
  'label_added',
  'label_removed',
  'attachment_added',
  'attachment_removed',
  'due_date_set',
  'due_date_removed',
  'priority_changed',
]);

export const activitiesTable = pgTable(
  'activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cardId: uuid('card_id').references(() => cardsTable.id, {
      onDelete: 'cascade',
    }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projectsTable.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id),
    type: activityTypeEnum('type').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('activities_card_id_idx').on(t.cardId),
    index('activities_project_id_idx').on(t.projectId),
  ]
);
