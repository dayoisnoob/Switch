import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../config/db';
import {
  cardAssigneesTable,
  cardLabelsTable,
  cardsTable,
  columnsTable,
  workspaceMembershipsTable,
} from '../db';
import { ApiError } from '../utils/api-response';
import type {
  CardDataType,
  MoveCardType,
  UpdateCardType,
} from '../validations/cards.validation';
import { ActivityService } from './activity.service';
import { emitBoardEvent } from '../socket/emitter';
import { NotificationService } from './notification.service';

export class CardsService {
  static async createCard(
    userId: string,
    workspaceId: string,
    columnId: string,
    boardId: string,
    projectId: string,
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

    await ActivityService.log({
      type: 'card_created',
      userId,
      projectId,
      cardId: newCard.id,
      metadata: { title: newCard.title },
    });
    emitBoardEvent(boardId, 'card:created', { card: newCard });

    return {
      id: newCard.id,
      title: newCard.title,
      description: newCard.description,
      priority: newCard.priority,
      dueDate: newCard.dueDate,
      coverImageUrl: newCard.coverImageUrl,
      order: newCard.order,
      createdBy: newCard.createdBy,
      assignees: [],
      labels: [],
    };
  }

  static async getCard(cardId: string) {
    const card = await db.query.cardsTable.findFirst({
      where: eq(cardsTable.id, cardId),
      columns: {
        id: true,
        title: true,
        description: true,
        priority: true,
        dueDate: true,
        coverImageUrl: true,
        order: true,
        createdBy: true,
        updatedAt: true,
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
    });

    if (!card) throw new ApiError(404, 'Card not found.');

    return {
      ...card,
      assignees: card.assignees.map((a) => a.user),
      labels: card.labels.map((l) => l.label),
    };
  }

  static async updateCard(
    userId: string,
    projectId: string,
    cardId: string,
    data: UpdateCardType
  ) {
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

    await ActivityService.log({
      type: 'card_updated',
      userId,
      projectId,
      cardId: updatedCard.id,
      metadata: {
        ...(title !== undefined && { title: updatedCard.title }),
        ...(description !== undefined && {
          description: updatedCard.description,
        }),
        ...(priority !== undefined && { to: updatedCard.priority }),
        ...(dueDate !== undefined && { dueDate: updatedCard.dueDate }),
      },
    });

    emitBoardEvent(updatedCard.boardId, 'card:updated', {
      cardId,
      changes: data,
    });

    return updatedCard;
  }

  static async deleteCard(userId: string, projectId: string, cardId: string) {
    const [deletedCard] = await db
      .delete(cardsTable)
      .where(eq(cardsTable.id, cardId))
      .returning();

    if (!deletedCard)
      throw new ApiError(500, 'Error deleting card. Please try again.');

    await ActivityService.log({
      type: 'card_deleted',
      userId,
      projectId,
      metadata: { title: deletedCard.title },
    });

    emitBoardEvent(deletedCard.boardId, 'card:deleted', {
      cardId,
      columnId: deletedCard.columnId,
    });

    return deletedCard;
  }

  static async moveCard(
    userId: string,
    projectId: string,
    cardId: string,
    data: MoveCardType
  ) {
    const { columnId, order } = data;

    console.log(cardId);
    console.log(data);

    const [column] = await db
      .select({ id: columnsTable.id })
      .from(columnsTable)
      .where(eq(columnsTable.id, columnId))
      .limit(1);

    if (!column)
      throw new ApiError(404, 'This column does not exist in this workspace.');

    const [updatedCard] = await db
      .update(cardsTable)
      .set({ columnId, order })
      .where(eq(cardsTable.id, cardId))
      .returning();

    if (!updatedCard) {
      throw new ApiError(404, 'Card not found');
    }

    await ActivityService.log({
      type: 'card_moved',
      userId,
      projectId,
      cardId,
      metadata: { columnId: updatedCard.columnId },
    });

    emitBoardEvent(updatedCard.boardId, 'card:moved', {
      cardId,
      columnId: updatedCard.columnId,
      order: updatedCard.order,
    });

    return;
  }

  static async assignUser(projectId: string, cardId: string, userId: string) {
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

    await ActivityService.log({
      type: 'assignee_added',
      userId,
      projectId,
      cardId,
      metadata: { userId: assignee.userId },
    });

    await NotificationService.create({
      type: 'card_assigned',
      userId: assignee.userId,
      title: 'You were assigned to a card',
      body: `You have been assigned to a card.`,
      entityId: cardId,
      entityType: 'card',
    });

    return assignee;
  }

  static async unassignUser(projectId: string, cardId: string, userId: string) {
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

    await ActivityService.log({
      type: 'assignee_removed',
      userId,
      projectId,
      cardId,
      metadata: { userId: assignee.userId },
    });

    return assignee;
  }

  static async attachLabel(
    userId: string,
    projectId: string,
    cardId: string,
    labelId: string
  ) {
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

    await ActivityService.log({
      type: 'label_added',
      userId,
      projectId,
      cardId,
      metadata: { labelId },
    });

    return label;
  }

  static async detatchLabel(
    userId: string,
    projectId: string,
    cardId: string,
    labelId: string
  ) {
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

    await ActivityService.log({
      type: 'label_removed',
      userId,
      projectId,
      cardId,
      metadata: { labelId },
    });

    return { message: 'Label removed successfully', label };
  }
}
