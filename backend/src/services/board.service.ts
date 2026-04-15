import { eq } from 'drizzle-orm';
import { db } from '../config/db';
import { boardsTable, projectsTable } from '../db';
import { ApiError } from '../utils/api-response';
import { ProjectService } from './project.service';

export class BoardService {
  static async getBoardState(
    userId: string,
    workspaceId: string,
    boardId: string
  ) {
    const isMember = await ProjectService.checkMembership(userId, workspaceId);
    if (!isMember) {
      throw new ApiError(403, 'You do not have access to this workspace');
    }

    const boardState = await db.query.boardsTable.findFirst({
      where: eq(boardsTable.id, boardId),
      with: {
        columns: {
          orderBy: (cols, { asc }) => [asc(cols.order)],
          with: {
            tasks: {
              orderBy: (tasks, { asc }) => [asc(tasks.order)],
              with: {
                assignees: true,
              },
            },
          },
        },
      },
    });

    if (!boardState) {
      throw new ApiError(404, 'Board not found');
    }

    const [project] = await db
      .select({ workspaceId: projectsTable.workspaceId })
      .from(projectsTable)
      .where(eq(projectsTable.id, boardState.projectId))
      .limit(1);

    if (project?.workspaceId !== workspaceId) {
      throw new ApiError(404, 'Board not found in this workspace');
    }

    return boardState;
  }
}
