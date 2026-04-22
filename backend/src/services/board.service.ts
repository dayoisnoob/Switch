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
                assignees: {
                  with: {
                    user: {
                      columns: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                      },
                    },
                  },
                },
                labels: {
                  with: { label: true },
                },
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
