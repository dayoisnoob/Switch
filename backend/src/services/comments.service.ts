import { and, desc, eq } from 'drizzle-orm';
import { db } from '../config/db';
import {
  cardAssigneesTable,
  cardsTable,
  commentsTable,
  usersTable,
} from '../db';
import { ApiError } from '../utils/api-response';
import type { CreateCommentType } from '../validations/comments.validation';
import { ActivityService } from './activity.service';
import { emitBoardEvent } from '../socket/emitter';
import { NotificationService } from './notification.service';

export class CommentService {
  static async createComment(
    userId: string,
    actorName: string,
    projectId: string,
    cardId: string,
    boardId: string,
    data: CreateCommentType
  ) {
    const [comment] = await db
      .insert(commentsTable)
      .values({
        userId,
        cardId,
        content: data.content,
      })
      .returning();

    if (!comment)
      throw new ApiError(500, 'Error creating comment. Please try again.');

    const [[commentAuthor], assignees, [commentCard]] = await Promise.all([
      db
        .select({
          id: usersTable.id,
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          avatarUrl: usersTable.avatarUrl,
        })
        .from(usersTable)
        .where(eq(usersTable.id, userId)),

      db
        .select({ userId: cardAssigneesTable.userId })
        .from(cardAssigneesTable)
        .where(eq(cardAssigneesTable.cardId, cardId)),

      db
        .select({
          title: cardsTable.title,
        })
        .from(cardsTable)
        .where(eq(cardsTable.id, cardId))
        .limit(1),
    ]);

    await ActivityService.log({
      type: 'comment_added',
      userId,
      projectId,
      cardId,
      metadata: { content: comment.content },
    });

    const usersToNotify = assignees.filter((a) => a.userId !== userId);
    if (usersToNotify.length > 0) {
      await Promise.all(
        usersToNotify.map((assignee) =>
          NotificationService.create({
            type: 'comment_added',
            userId: assignee.userId,
            title: 'New comment on your task',
            body: `${actorName} commented on "${commentCard?.title || 'a card'}" you're assigned to.`,
            entityId: cardId,
            entityType: 'card',
          })
        )
      );
    }

    const formattedComment = {
      id: comment.id,
      content: comment.content,
      isEdited: comment.isEdited,
      createdAt: comment.createdAt,
      author: {
        id: commentAuthor?.id,
        firstName: commentAuthor?.firstName,
        lastName: commentAuthor?.lastName,
        avatarUrl: commentAuthor?.avatarUrl,
      },
    };

    emitBoardEvent(boardId, 'comment:created', {
      cardId,
      actorId: userId,
      actorName,
      cardTitle: commentCard?.title,
    });

    return formattedComment;
  }

  static async fetchComments(cardId: string) {
    const comments = await db
      .select({
        id: commentsTable.id,
        content: commentsTable.content,
        isEdited: commentsTable.isEdited,
        createdAt: commentsTable.createdAt,
        userId: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        avatarUrl: usersTable.avatarUrl,
      })
      .from(commentsTable)
      .innerJoin(usersTable, eq(commentsTable.userId, usersTable.id))
      .orderBy(desc(commentsTable.createdAt))
      .where(eq(commentsTable.cardId, cardId));

    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      isEdited: c.isEdited,
      createdAt: c.createdAt,
      author: {
        id: c.userId,
        firstName: c.firstName,
        lastName: c.lastName,
        avatarUrl: c.avatarUrl,
      },
    }));
  }

  static async editComment(
    userId: string,
    actorName: string,
    projectId: string,
    commentId: string,
    cardId: string,
    boardId: string,
    data: CreateCommentType
  ) {
    const comment = await CommentService.fetchComment(commentId, cardId);

    if (comment.userId !== userId)
      throw new ApiError(403, 'You are not authorised to edit this comment.');

    const [editedComment] = await db
      .update(commentsTable)
      .set({ content: data.content, isEdited: true })
      .where(
        and(eq(commentsTable.id, comment.id), eq(commentsTable.cardId, cardId))
      )
      .returning();

    if (!editedComment)
      throw new ApiError(500, 'Error updating comment. Please try again.');

    const [editedCommentCard] = await db
      .select({
        title: cardsTable.title,
      })
      .from(cardsTable)
      .where(eq(cardsTable.id, cardId))
      .limit(1);

    await ActivityService.log({
      type: 'comment_edited',
      userId,
      projectId,
      cardId,
      metadata: { content: editedComment.content },
    });

    emitBoardEvent(boardId, 'comment:updated', {
      cardId,
      actorId: userId,
      actorName,
      cardTitle: editedCommentCard?.title,
    });

    return editedComment;
  }

  static async deleteComment(
    userId: string,
    actorName: string,
    projectId: string,
    commentId: string,
    cardId: string,
    boardId: string,
    role: string
  ) {
    const comment = await CommentService.fetchComment(commentId, cardId);

    const canDelete =
      comment.userId === userId || ['admin', 'owner'].includes(role);

    if (!canDelete) throw new ApiError(403, 'You cannot delete this comment.');

    const [deletedComment] = await db
      .delete(commentsTable)
      .where(
        and(eq(commentsTable.id, comment.id), eq(commentsTable.cardId, cardId))
      )
      .returning();

    if (!deletedComment)
      throw new ApiError(500, 'Error deleting comment. Please try again.');

    const [deletedCommentCard] = await db
      .select({
        title: cardsTable.title,
      })
      .from(cardsTable)
      .where(eq(cardsTable.id, cardId))
      .limit(1);

    await ActivityService.log({
      type: 'comment_deleted',
      userId,
      projectId,
      cardId,
      metadata: { id: deletedComment.id },
    });

    console.log('about to emit comment:updated');

    emitBoardEvent(boardId, 'comment:deleted', {
      cardId,
      actorId: userId,
      actorName,
      cardTitle: deletedCommentCard?.title,
    });

    return deletedComment;
  }

  private static async fetchComment(commentId: string, cardId: string) {
    const [comment] = await db
      .select({ id: commentsTable.id, userId: commentsTable.userId })
      .from(commentsTable)
      .where(
        and(eq(commentsTable.id, commentId), eq(commentsTable.cardId, cardId))
      )
      .limit(1);

    if (!comment) throw new ApiError(404, 'Comment not found');

    return comment;
  }
}
