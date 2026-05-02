import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '../config/db';
import { activitiesTable, boardsTable, cardsTable, commentsTable } from '../db';
import { ApiError } from '../utils/api-response';

export const BoardService = {
  getBoardState: async (projectId: string) => {
    // 1. Fetch core board state normally (board -> columns -> cards with nested user/labels)
    // This is essentially your original query.
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
            mappedStatus: true,
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
                        userId: true,
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
                        colour: true,
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

    const cardIds = boardState.columns.flatMap((col) =>
      col.cards.map((card) => card.id)
    );

    if (cardIds.length === 0) {
      return {
        ...boardState,
        columns: boardState.columns.map((col) => ({ ...col, cards: [] })),
      };
    }

    const commentsCountPromise = db
      .select({
        id: commentsTable.cardId,
        commentCount: sql`count(${commentsTable.id})`.mapWith(Number),
      })
      .from(commentsTable)
      .where(inArray(commentsTable.cardId, cardIds))
      .groupBy(commentsTable.cardId);

    const activitiesCountPromise = db
      .select({
        id: activitiesTable.cardId,
        activityCount: sql`count(${activitiesTable.id})`.mapWith(Number),
      })
      .from(activitiesTable)
      .where(inArray(activitiesTable.cardId, cardIds))
      .groupBy(activitiesTable.cardId);

    const [commentsCountResult, activitiesCountResult] = await Promise.all([
      commentsCountPromise,
      activitiesCountPromise,
    ]);

    const commentsCountMap = new Map(
      commentsCountResult.map((r) => [r.id, r.commentCount])
    );
    const activitiesCountMap = new Map(
      activitiesCountResult.map((r) => [r.id, r.activityCount])
    );

    return {
      ...boardState,
      columns: boardState.columns.map((col) => ({
        ...col,
        cards: col.cards.map((card) => {
          const commentCount = commentsCountMap.get(card.id) ?? 0;
          const activityCount = activitiesCountMap.get(card.id) ?? 0;

          return {
            ...card,
            assignees: card.assignees.map((a) => a.user),
            labels: card.labels.map((l) => l.label),
            commentCount,
            activityCount,
          };
        }),
      })),
    };
  },
};
