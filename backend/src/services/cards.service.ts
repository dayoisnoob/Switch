import { and, count, desc, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { db } from '../config/db';
import {
  attachmentsTable,
  boardsTable,
  cardAssigneesTable,
  cardLabelsTable,
  cardsTable,
  columnsTable,
  labelsTable,
  projectsTable,
  usersTable,
  workspaceMembershipsTable,
} from '../db';
import { emitBoardEvent } from '../socket/emitter';
import { ApiError } from '../utils/api-response';
import type {
  CardDataType,
  MoveCardType,
  UpdateCardType,
} from '../validations/cards.validation';
import { ActivityService } from './activity.service';
import { NotificationService } from './notification.service';
import { cloudinary } from '../config/cloudinary';
import { logger } from '../config/logger';
import { generateKeyBetween } from 'fractional-indexing';

export class CardsService {
  static async createCard(
    userId: string,
    actorName: string,
    workspaceId: string,
    columnId: string,
    boardId: string,
    projectId: string,
    data: CardDataType
  ) {
    const { title, description, status, priority, dueDate, assignees } = data;

    const newCard = await db.transaction(async (tx) => {
      const [lastCard] = await tx
        .select({ order: cardsTable.order })
        .from(cardsTable)
        .where(eq(cardsTable.columnId, columnId))
        .orderBy(desc(cardsTable.order))
        .limit(1);

      const newOrder = generateKeyBetween(lastCard?.order ?? null, null);

      const [newCard] = await tx
        .insert(cardsTable)
        .values({
          columnId,
          boardId: boardId,
          title,
          status,
          priority,
          dueDate,
          description,
          createdBy: userId,
          order: newOrder,
        })
        .returning();

      if (!newCard) {
        throw new ApiError(500, 'Error creating card. Please try again');
      }

      let assigneesData;

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

        assigneesData = assignees.map((userId: string) => ({
          cardId: newCard.id,
          userId,
        }));

        await tx.insert(cardAssigneesTable).values(assigneesData).returning();
      }

      return newCard;
    });

    if (assignees && assignees.length > 0) {
      const usersToNotify = assignees.filter((id: string) => id !== userId);

      await Promise.all(
        usersToNotify.map((assigneeId: string) =>
          NotificationService.create({
            type: 'card_assigned',
            userId: assigneeId,
            title: newCard
              ? `${actorName} assigned you to ${newCard.title}`
              : `You have been assigned to a new task.`,
            body: '',
            entityId: newCard.id,
            entityType: 'card',
          })
        )
      );
    }

    await ActivityService.log({
      type: 'card_created',
      userId,
      projectId,
      cardId: newCard.id,
      metadata: { title: newCard.title },
    });

    emitBoardEvent(boardId, 'card:created', {
      card: newCard,
      columnId,
      actorId: userId,
      actorName,
      cardTitle: newCard.title,
    });

    return {
      id: newCard.id,
      title: newCard.title,
      description: newCard.description,
      priority: newCard.priority,
      dueDate: newCard.dueDate,
      status: newCard.status,
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
        createdAt: true,
      },
      with: {
        creator: { columns: { id: true, firstName: true, lastName: true } },
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
                colour: true,
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

  static async getUserOpenCardsCount(userId: string) {
    const [result] = await db
      .select({ total: count(cardsTable.id) })
      .from(cardsTable)
      .innerJoin(boardsTable, eq(cardsTable.boardId, boardsTable.id))
      .innerJoin(projectsTable, eq(boardsTable.projectId, projectsTable.id))
      .innerJoin(
        workspaceMembershipsTable,
        eq(projectsTable.workspaceId, workspaceMembershipsTable.workspaceId)
      )
      .where(
        and(
          eq(workspaceMembershipsTable.userId, userId),
          notInArray(cardsTable.status, ['DONE', 'CANCELED'])
        )
      );

    return result?.total;
  }

  static async updateCard(
    userId: string,
    actorName: string,
    projectId: string,
    cardId: string,
    data: UpdateCardType
  ) {
    const { title, description, priority, dueDate } = data;

    const [card] = await db
      .select({ title: cardsTable.title })
      .from(cardsTable)
      .where(eq(cardsTable.id, cardId))
      .limit(1);

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
      type: priority
        ? 'priority_changed'
        : dueDate
          ? 'due_date_set'
          : 'card_updated',
      userId,
      projectId,
      cardId: updatedCard.id,
      metadata: {
        ...(title !== undefined && { title: updatedCard.title }),
        ...(description !== undefined && {
          description: updatedCard.description,
        }),
        ...(priority !== undefined && { priority: updatedCard.priority }),
        ...(dueDate !== undefined && { dueDate: updatedCard.dueDate }),
      },
    });

    emitBoardEvent(updatedCard.boardId, 'card:updated', {
      cardId,
      changes: data,
      actorId: userId,
      actorName,
      cardTitle: card?.title,
    });

    return updatedCard;
  }

  static async deleteCard(
    userId: string,
    actorName: string,
    projectId: string,
    cardId: string
  ) {
    const [deletedCard] = await db
      .delete(cardsTable)
      .where(eq(cardsTable.id, cardId))
      .returning();

    if (!deletedCard)
      throw new ApiError(500, 'Error deleting card. Please try again.');

    const attachments = await db
      .select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.cardId, cardId));

    if (attachments.length > 0) {
      try {
        const deletePromises = attachments.map((attachment) =>
          cloudinary.uploader.destroy(attachment.publicId, {
            resource_type: attachment.resourceType,
          })
        );

        await Promise.all(deletePromises);
      } catch (error) {
        logger.error(error, 'Failed to delete attachments from Cloudinary');
      }
    }

    await ActivityService.log({
      type: 'card_deleted',
      userId,
      projectId,
      metadata: { title: deletedCard.title },
    });

    emitBoardEvent(deletedCard.boardId, 'card:deleted', {
      cardId,
      actorName,
      actorId: userId,
      columnId: deletedCard.columnId,
      cardTitle: deletedCard.title,
    });

    return deletedCard;
  }

  static async moveCard(
    userId: string,
    actorName: string,
    projectId: string,
    cardId: string,
    data: MoveCardType
  ) {
    const { columnId, order, status } = data;

    const [oldCol] = await db
      .select({ id: columnsTable.id, name: columnsTable.name })
      .from(cardsTable)
      .innerJoin(columnsTable, eq(cardsTable.columnId, columnsTable.id))
      .where(eq(cardsTable.id, cardId))
      .limit(1);

    if (!oldCol) throw new ApiError(404, 'Failed to determine previous column');

    const [newCol] = await db
      .select({ name: columnsTable.name })
      .from(columnsTable)
      .where(eq(columnsTable.id, columnId))
      .limit(1);

    if (!newCol)
      throw new ApiError(404, 'This column does not exist in this workspace.');

    const [updatedCard] = await db
      .update(cardsTable)
      .set({ columnId, order, status })
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
      metadata: { from: oldCol.name, to: newCol?.name },
    });

    emitBoardEvent(updatedCard.boardId, 'card:moved', {
      cardId,
      fromColumnId: oldCol.id,
      toColumnId: updatedCard.columnId,
      order: updatedCard.order,
      actorId: userId,
      actorName,
      fromColumnName: oldCol.name,
      toColumnName: newCol.name,
    });

    return;
  }

  static async assignUser(
    userId: string,
    actorName: string,
    assigneeId: string,
    projectId: string,
    cardId: string,
    boardId: string
  ) {
    const [existing] = await db
      .select({ id: cardAssigneesTable.id })
      .from(cardAssigneesTable)
      .where(
        and(
          eq(cardAssigneesTable.cardId, cardId),
          eq(cardAssigneesTable.userId, assigneeId)
        )
      )
      .limit(1);

    if (existing)
      throw new ApiError(409, 'User is already assigned to this card.');

    const [assignee] = await db
      .insert(cardAssigneesTable)
      .values({ cardId, userId: assigneeId })
      .returning();

    if (!assignee)
      throw new ApiError(500, 'Error assigning user. Please try again.');

    const [user] = await db
      .select({
        userId: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        avatarUrl: usersTable.avatarUrl,
      })
      .from(usersTable)
      .where(eq(usersTable.id, assignee.userId))
      .limit(1);

    if (!user) throw new ApiError(404, 'Could not find this assignee');

    const [card] = await db
      .select({ title: cardsTable.title })
      .from(cardsTable)
      .where(eq(cardsTable.id, cardId))
      .limit(1);

    const assigneeName = `${user?.firstName} ${user?.lastName}`;

    await ActivityService.log({
      type: 'assignee_added',
      userId,
      projectId,
      cardId,
      metadata: { assigneeName },
    });

    await NotificationService.create({
      type: 'card_assigned',
      userId: assigneeId,
      title: card
        ? `${actorName} assigned you to ${card.title}`
        : `You have been assigned to a new task.`,
      body: '',
      entityId: cardId,
      entityType: 'card',
    });

    emitBoardEvent(boardId, 'assignee:added', {
      cardId,
      assignee: user,
      actorId: userId,
      actorName,
      cardTitle: card?.title,
    });

    return assignee;
  }

  static async unassignUser(
    userId: string,
    actorName: string,
    assigneeId: string,
    projectId: string,
    cardId: string,
    boardId: string
  ) {
    const [assignee] = await db
      .delete(cardAssigneesTable)
      .where(
        and(
          eq(cardAssigneesTable.cardId, cardId),
          eq(cardAssigneesTable.userId, assigneeId)
        )
      )
      .returning();

    if (!assignee) throw new ApiError(404, 'Assignee not found.');

    const [user] = await db
      .select({
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
      })
      .from(usersTable)
      .where(eq(usersTable.id, assignee.userId))
      .limit(1);

    if (!user) throw new ApiError(404, 'Could not find this assignee');

    const [card] = await db
      .select({ title: cardsTable.title })
      .from(cardsTable)
      .where(eq(cardsTable.id, cardId))
      .limit(1);

    const assigneeName = `${user?.firstName} ${user?.lastName}`;

    await ActivityService.log({
      type: 'assignee_removed',
      userId,
      projectId,
      cardId,
      metadata: { assigneeName },
    });

    await NotificationService.create({
      type: 'card_unassigned',
      userId: assigneeId,
      title: card
        ? `${actorName} removed you from ${card.title}`
        : `You have been assigned to a new task.`,
      body: '',
      entityId: cardId,
      entityType: 'card',
    });

    emitBoardEvent(boardId, 'assignee:removed', {
      cardId,
      assigneeId: assignee.userId,
      assigneeName,
      actorId: userId,
      actorName,
      cardTitle: card?.title,
    });

    return assignee;
  }

  static async attachLabel(
    userId: string,
    actorName: string,
    projectId: string,
    cardId: string,
    labelId: string,
    boardId: string
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

    const [newCardLabel] = await db
      .insert(cardLabelsTable)
      .values({ cardId, labelId })
      .returning();

    if (!newCardLabel)
      throw new ApiError(500, 'Error attaching label. Please try again.');

    const [[labelData], [cardData]] = await Promise.all([
      db
        .select({
          id: labelsTable.id,
          name: labelsTable.name,
          colour: labelsTable.colour,
        })
        .from(labelsTable)
        .where(eq(labelsTable.id, labelId))
        .limit(1),
      db
        .select({ title: cardsTable.title })
        .from(cardsTable)
        .where(eq(cardsTable.id, cardId))
        .limit(1),
    ]);

    if (!labelData) throw new ApiError(404, 'Could not find this label');
    if (!cardData) throw new ApiError(404, 'Could not find this card');

    await ActivityService.log({
      type: 'label_added',
      userId,
      projectId,
      cardId,
      metadata: { labelName: labelData.name },
    });

    emitBoardEvent(boardId, 'label:attached', {
      cardId,
      label: labelData,
      actorId: userId,
      actorName,
      cardTitle: cardData?.title,
    });

    return labelData;
  }

  static async detatchLabel(
    userId: string,
    actorName: string,
    projectId: string,
    cardId: string,
    labelId: string,
    boardId: string
  ) {
    const [[labelData], [cardData]] = await Promise.all([
      db
        .select({
          id: labelsTable.id,
          name: labelsTable.name,
          colour: labelsTable.colour,
        })
        .from(labelsTable)
        .where(eq(labelsTable.id, labelId))
        .limit(1),
      db
        .select({ title: cardsTable.title })
        .from(cardsTable)
        .where(eq(cardsTable.id, cardId))
        .limit(1),
    ]);

    if (!labelData) throw new ApiError(404, 'Could not find this label');
    if (!cardData) throw new ApiError(404, 'Could not find this card');

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
      metadata: { labelName: labelData.name },
    });

    emitBoardEvent(boardId, 'label:removed', {
      cardId,
      label: labelData,
      actorId: userId,
      actorName,
      cardTitle: cardData?.title,
    });

    return { message: 'Label removed successfully', label };
  }
}
