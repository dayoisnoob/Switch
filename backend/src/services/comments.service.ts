import { and, eq } from 'drizzle-orm';
import { db } from '../config/db';
import { cardAssigneesTable, commentsTable, usersTable } from '../db';
import { ApiError } from '../utils/api-response';
import type { CreateCommentType } from '../validations/comments.validation';
import { ActivityService } from './activity.service';
import { emitBoardEvent } from '../socket/emitter';
import { NotificationService } from './notification.service';

export class CommentService {
  static async createComment(
    userId: string,
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

    const [user] = await db
      .select({
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        avatarUrl: usersTable.avatarUrl,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    await ActivityService.log({
      type: 'comment_added',
      userId,
      projectId,
      cardId,
      metadata: { content: comment.content },
    });

    emitBoardEvent(boardId, 'comment:created', {
      commentId: comment.id,
      cardId,
      content: comment.content,
    });

    const assignees = await db
      .select({ userId: cardAssigneesTable.userId })
      .from(cardAssigneesTable)
      .where(eq(cardAssigneesTable.cardId, cardId));

    for (const assignee of assignees) {
      if (assignee.userId === userId) continue;

      await NotificationService.create({
        type: 'comment_added',
        userId: assignee.userId,
        title: 'New comment on your card',
        body: `Someone commented on a card you're assigned to.`,
        entityId: cardId,
        entityType: 'card',
      });
    }

    return {
      id: comment.id,
      content: comment.content,
      isEdited: comment.isEdited,
      createdAt: comment.createdAt,
      author: {
        firstName: user?.firstName,
        lastName: user?.lastName,
        avatarUrl: user?.avatarUrl,
      },
    };
  }

  static async editComment(
    userId: string,
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

    await ActivityService.log({
      type: 'comment_edited',
      userId,
      projectId,
      cardId,
      metadata: { content: editedComment.content },
    });

    emitBoardEvent(boardId, 'comment:updated', {
      commentId,
      cardId,
      content: editedComment.content,
    });

    return editedComment;
  }

  static async deleteComment(
    userId: string,
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

    await ActivityService.log({
      type: 'comment_deleted',
      userId,
      projectId,
      cardId,
      metadata: { id: deletedComment.id },
    });

    emitBoardEvent(boardId, 'comment:deleted', {
      commentId,
      cardId,
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
