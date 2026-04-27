import { eq } from 'drizzle-orm';
import { db } from '../config/db';
import { boardsTable } from '../db';
import { ApiError } from '../utils/api-response';

export class BoardService {
  static async getBoardState(projectId: string) {
    const boardState = await db.query.boardsTable.findFirst({
      where: eq(boardsTable.projectId, projectId),
      columns: {
        id: true,
        projectId: true,
      },
      with: {
        columns: {
          orderBy: (cols, { asc }) => [asc(cols.order)],
          columns: {
            id: true,
            name: true,
            order: true,
          },
          with: {
            cards: {
              orderBy: (cards, { asc }) => [asc(cards.order)],
              columns: {
                id: true,
                title: true,
                description: true,
                priority: true,
                dueDate: true,
                coverImageUrl: true,
                order: true,
              },
              with: {
                assignees: {
                  columns: {},
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
                  columns: {},
                  with: {
                    label: {
                      columns: {
                        id: true,
                        name: true,
                        color: true,
                      },
                    },
                  },
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

    return {
      ...boardState,
      columns: boardState.columns.map((col) => ({
        ...col,
        cards: col.cards.map((card) => ({
          ...card,
          assignees: card.assignees.map((a) => a.user),
          labels: card.labels.map((l) => l.label),
        })),
      })),
    };
  }
}
