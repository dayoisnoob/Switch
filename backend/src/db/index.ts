import { relations } from 'drizzle-orm';
import { boardsTable } from './schema/boards.schema';
import { columnsTable } from './schema/columns.schema';
import { taskAssigneesTable, tasksTable } from './schema/tasks.schema';

export * from './schema/users.schema';
export * from './schema/otp.schema';
export * from './schema/auth.schema';
export * from './schema/workspaces.schema';
export * from './schema/projects.schema';
export * from './schema/boards.schema';
export * from './schema/columns.schema';
export * from './schema/tasks.schema';
export * from './schema/labels.schema';
export * from './schema/comments.schema';
export * from './schema/attachments.schema';
export * from './schema/activities.schema';
export * from './schema/notifications.schema';

export const boardRelations = relations(boardsTable, ({ many }) => ({
  columns: many(columnsTable),
}));

export const columnRelations = relations(columnsTable, ({ one, many }) => ({
  board: one(boardsTable, {
    fields: [columnsTable.boardId],
    references: [boardsTable.id],
  }),
  tasks: many(tasksTable),
}));
export const taskRelations = relations(tasksTable, ({ one, many }) => ({
  column: one(columnsTable, {
    fields: [tasksTable.columnId],
    references: [columnsTable.id],
  }),
  assignees: many(taskAssigneesTable),
}));

export const taskAssigneeRelations = relations(
  taskAssigneesTable,
  ({ one }) => ({
    task: one(tasksTable, {
      fields: [taskAssigneesTable.taskId],
      references: [tasksTable.id],
    }),
  })
);
