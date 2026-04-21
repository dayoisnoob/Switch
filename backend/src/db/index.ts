import { relations } from 'drizzle-orm';
import { boardsTable } from './schema/boards.schema';
import { columnsTable } from './schema/columns.schema';
import { cardAssigneesTable, cardsTable } from './schema/cards.schema';
import { projectsTable } from './schema/projects.schema';
import { cardLabelsTable, labelsTable } from './schema/labels.schema';
import { usersTable } from './schema/users.schema';

export * from './schema/users.schema';
export * from './schema/otp.schema';
export * from './schema/auth.schema';
export * from './schema/workspaces.schema';
export * from './schema/projects.schema';
export * from './schema/boards.schema';
export * from './schema/columns.schema';
export * from './schema/cards.schema';
export * from './schema/labels.schema';
export * from './schema/comments.schema';
export * from './schema/attachments.schema';
export * from './schema/activities.schema';
export * from './schema/notifications.schema';

export const boardRelations = relations(boardsTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [boardsTable.projectId],
    references: [projectsTable.id],
  }),
  columns: many(columnsTable),
}));

export const columnRelations = relations(columnsTable, ({ one, many }) => ({
  board: one(boardsTable, {
    fields: [columnsTable.boardId],
    references: [boardsTable.id],
  }),
  cards: many(cardsTable),
}));

export const cardRelations = relations(cardsTable, ({ one, many }) => ({
  column: one(columnsTable, {
    fields: [cardsTable.columnId],
    references: [columnsTable.id],
  }),
  assignees: many(cardAssigneesTable),
  labels: many(cardLabelsTable),
}));

export const cardAssigneeRelations = relations(
  cardAssigneesTable,
  ({ one }) => ({
    card: one(cardsTable, {
      fields: [cardAssigneesTable.cardId],
      references: [cardsTable.id],
    }),
    user: one(usersTable, {
      fields: [cardAssigneesTable.userId],
      references: [usersTable.id],
    }),
  })
);

export const cardLabelRelations = relations(cardLabelsTable, ({ one }) => ({
  card: one(cardsTable, {
    fields: [cardLabelsTable.cardId],
    references: [cardsTable.id],
  }),
  label: one(labelsTable, {
    fields: [cardLabelsTable.labelId],
    references: [labelsTable.id],
  }),
}));
