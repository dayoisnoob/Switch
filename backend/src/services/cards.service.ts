import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../config/db';
import {
  cardAssigneesTable,
  cardLabelsTable,
  cardsTable,
  workspaceMembershipsTable,
} from '../db';
import { ApiError } from '../utils/api-response';
import type {
  CardDataType,
  MoveCardType,
  UpdateCardType,
} from '../validations/cards.validation';

export class CardsService {
  static async createCard(
    userId: string,
    workspaceId: string,
    columnId: string,
    boardId: string,
    data: CardDataType
  ) {
    const { title, description, assignees } = data;

    const [lastCard] = await db
      .select({ order: cardsTable.order })
      .from(cardsTable)
      .where(eq(cardsTable.columnId, columnId))
      .orderBy(desc(cardsTable.order))
      .limit(1);

    const newOrder = lastCard ? lastCard.order + 1.0 : 1.0;

    const newCard = await db.transaction(async (tx) => {
      const [card] = await tx
        .insert(cardsTable)
        .values({
          columnId,
          boardId: boardId,
          title,
          description,
          createdBy: userId,
          order: newOrder,
        })
        .returning();

      if (!card) {
        throw new ApiError(500, 'Error creating card. Please try again');
      }

      if (assignees && assignees.length > 0) {
        const members = await tx
          .select({ userId: workspaceMembershipsTable.userId })
          .from(workspaceMembershipsTable)
          .where(
            and(
              eq(workspaceMembershipsTable.workspaceId, workspaceId),
              inArray(workspaceMembershipsTable.userId, assignees)
            )
          );

        if (members.length !== assignees.length) {
          throw new ApiError(
            400,
            'One or more assignees are not workspace members.'
          );
        }

        const assigneesData = assignees.map((userId: string) => ({
          cardId: card.id,
          userId,
        }));

        await tx.insert(cardAssigneesTable).values(assigneesData).returning();
      }

      return card;
    });
    return newCard;
  }

  static async getCard(cardId: string) {
    const card = await db.query.cardsTable.findFirst({
      where: eq(cardsTable.id, cardId),
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
          with: {
            label: true,
          },
        },
      },
    });

    if (!card) throw new ApiError(404, 'Card not found.');
    return card;
  }

  static async updateCard(cardId: string, data: UpdateCardType) {
    const { title, description, priority, dueDate } = data;
    const [updatedCard] = await db
      .update(cardsTable)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate }),
      })
      .where(eq(cardsTable.id, cardId))
      .returning();

    if (!updatedCard)
      throw new ApiError(500, 'Error updating card. Please try again.');

    return updatedCard;
  }

  static async deleteCard(cardId: string) {
    const [deletedCard] = await db
      .delete(cardsTable)
      .where(eq(cardsTable.id, cardId))
      .returning();

    if (!deletedCard)
      throw new ApiError(500, 'Error deleting card. Please try again.');

    return deletedCard;
  }

  static async moveCard(cardId: string, data: MoveCardType) {
    const { columnId, order } = data;

    const [updatedCard] = await db
      .update(cardsTable)
      .set({ columnId, order })
      .where(eq(cardsTable.id, cardId))
      .returning();

    if (!updatedCard) {
      throw new ApiError(404, 'Card not found');
    }

    return updatedCard;
  }

  static async assignUser(cardId: string, userId: string) {
    const [existing] = await db
      .select({ id: cardAssigneesTable.id })
      .from(cardAssigneesTable)
      .where(
        and(
          eq(cardAssigneesTable.cardId, cardId),
          eq(cardAssigneesTable.userId, userId)
        )
      )
      .limit(1);

    if (existing)
      throw new ApiError(409, 'User is already assigned to this card.');

    const [assignee] = await db
      .insert(cardAssigneesTable)
      .values({ cardId, userId })
      .returning();

    if (!assignee)
      throw new ApiError(500, 'Error assigning user. Please try again.');

    return assignee;
  }

  static async unassignUser(cardId: string, userId: string) {
    const [assignee] = await db
      .delete(cardAssigneesTable)
      .where(
        and(
          eq(cardAssigneesTable.cardId, cardId),
          eq(cardAssigneesTable.userId, userId)
        )
      )
      .returning();

    if (!assignee) throw new ApiError(404, 'Assignee not found.');
    return assignee;
  }

  static async attachLabel(cardId: string, labelId: string) {
    const [existing] = await db
      .select({ id: cardLabelsTable.id })
      .from(cardLabelsTable)
      .where(
        and(
          eq(cardLabelsTable.cardId, cardId),
          eq(cardLabelsTable.labelId, labelId)
        )
      )
      .limit(1);

    if (existing)
      throw new ApiError(409, 'Label is already attached to this card.');

    const [label] = await db
      .insert(cardLabelsTable)
      .values({ cardId, labelId })
      .returning();

    if (!label)
      throw new ApiError(500, 'Error attaching label. Please try again.');

    return label;
  }

  static async detatchLabel(cardId: string, labelId: string) {
    const [label] = await db
      .delete(cardLabelsTable)
      .where(
        and(
          eq(cardLabelsTable.labelId, labelId),
          eq(cardLabelsTable.cardId, cardId)
        )
      )
      .returning();

    if (!label)
      throw new ApiError(500, 'Error removing label. Please try again.');

    return { message: 'Label removed successfully', label };
  }
}
