import { and, eq } from 'drizzle-orm';
import { db } from '../config/db';
import { commentsTable, labelsTable } from '../db';
import { ApiError } from '../utils/api-response';
import type { CreateCommentType } from '../validations/comment.validation';
import type { UpdateLabelType } from '../validations/label.validation';

export class CommentService {
  static async createComment(
    userId: string,
    cardId: string,
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

    return comment;
  }

  static async editComment(
    userId: string,
    commentId: string,
    cardId: string,
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

    return editedComment;
  }

  static async deleteComment(
    userId: string,
    commentId: string,
    cardId: string,
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
      throw new ApiError(500, 'Error deleting label. Please try again.');

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
