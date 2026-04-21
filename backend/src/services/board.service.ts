import { eq } from 'drizzle-orm';
import { db } from '../config/db';
import { boardsTable } from '../db';
import { ApiError } from '../utils/api-response';

export class BoardService {
  static async getBoardState(projectId: string) {
    const boardState = await db.query.boardsTable.findFirst({
      where: eq(boardsTable.projectId, projectId),
      with: {
        columns: {
          orderBy: (cols, { asc }) => [asc(cols.order)],
          with: {
            cards: {
              orderBy: (cards, { asc }) => [asc(cards.order)],
              with: {
                assignees: true,
                labels: true,
              },
            },
          },
        },
      },
    });

    if (!boardState) {
      throw new ApiError(404, 'Board not found');
    }

    return boardState;
  }
}

//  const [project] = await db
//    .select({ workspaceId: projectsTable.workspaceId })
//    .from(projectsTable)
//    .where(eq(projectsTable.id, boardState.projectId))
//    .limit(1);

//  if (project?.workspaceId !== workspaceId) {
//    throw new ApiError(404, 'Board not found in this workspace');
//  }
