import { desc, eq } from 'drizzle-orm';
import { db } from '../config/db';
import {
  boardsTable,
  columnsTable,
  projectsTable,
  taskAssigneesTable,
  tasksTable,
} from '../db';
import { ApiError } from '../utils/api-response';
import type { TaskDetailsType } from '../validations/task.validation';
import { ProjectService } from './project.service';

export class TasksService {
  static async createTask(userId: string, taskDetails: TaskDetailsType) {
    const { title, description, columnId, assignees } = taskDetails;

    const column = await TasksService.verifyWorkspaceAccess(userId, columnId);

    const [lastTask] = await db
      .select({ order: tasksTable.order })
      .from(tasksTable)
      .where(eq(tasksTable.columnId, columnId))
      .orderBy(desc(tasksTable.order))
      .limit(1);

    const newOrder = lastTask ? lastTask.order + 1000 : 1000;

    const newTask = await db.transaction(async (tx) => {
      const [task] = await tx
        .insert(tasksTable)
        .values({
          columnId,
          boardId: column.boardId,
          title,
          description,
          createdBy: userId,
          order: newOrder,
        })
        .returning();

      if (!task) {
        throw new ApiError(500, 'Error creating task. Please try again');
      }

      if (assignees && assignees.length > 0) {
        const assigneesData = assignees.map((a: string) => ({
          taskId: task.id,
          userId: a,
        }));

        await tx.insert(taskAssigneesTable).values(assigneesData).returning();
      }

      return task;
    });
    return newTask;
  }

  static async moveTask(
    userId: string,
    taskId: string,
    columnId: string,
    order: number
  ) {
    await TasksService.verifyWorkspaceAccess(userId, columnId);

    const [updatedTask] = await db
      .update(tasksTable)
      .set({
        columnId,
        order,
      })
      .where(eq(tasksTable.id, taskId))
      .returning();

    if (!updatedTask) {
      throw new ApiError(404, 'Task not found');
    }

    return updatedTask;
  }

  private static async verifyWorkspaceAccess(userId: string, columnId: string) {
    const [column] = await db
      .select({
        boardId: columnsTable.boardId,
        workspaceId: projectsTable.workspaceId,
      })
      .from(columnsTable)
      .innerJoin(boardsTable, eq(columnsTable.boardId, boardsTable.id))
      .innerJoin(projectsTable, eq(boardsTable.projectId, projectsTable.id))
      .where(eq(columnsTable.id, columnId))
      .limit(1);

    if (!column) {
      throw new ApiError(404, 'This column does not exist');
    }

    const isMember = await ProjectService.checkMembership(
      userId,
      column.workspaceId
    );

    if (!isMember) {
      throw new ApiError(403, 'You do not have access to this workspace');
    }

    return column;
  }
}
