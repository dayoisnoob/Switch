import type { Response } from 'express';
import { CommentService } from '../services/comments.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../utils/api-response';

export class CommentController {
  static async createComment(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id!;
    const cardId = req.resolvedCard?.id!;
    const projectId = req.resolvedCard?.projectId!;
    const boardId = req.resolvedCard?.boardId!;

    const comment = await CommentService.createComment(
      userId,
      req.user,
      projectId,
      cardId,
      boardId,
      req.body
    );

    res
      .status(201)
      .json(new ApiResponse(200, 'Comment added successfully', comment));
  }

  static async fetchComments(req: AuthenticatedRequest, res: Response) {
    const cardId = req.params.cardId as string;
    const comments = await CommentService.fetchComments(cardId);

    res.json(new ApiResponse(200, 'Comments fetched successfully', comments));
  }

  static async editComment(req: AuthenticatedRequest, res: Response) {
    const actorName = `${req.user?.firstName} ${req.user?.lastName}`.trim();
    const userId = req.user.id;

    const commentId = req.resolvedComment?.id!;
    const cardId = req.resolvedComment?.cardId!;
    const projectId = req.resolvedComment?.projectId!;
    const boardId = req.resolvedComment?.boardId!;

    const comment = await CommentService.editComment(
      userId,
      actorName,
      projectId,
      commentId,
      cardId,
      boardId,
      req.body
    );

    res.json(new ApiResponse(200, 'Comment edited successfully', comment));
  }

  static async deleteComment(req: AuthenticatedRequest, res: Response) {
    const actorName = `${req.user?.firstName} ${req.user?.lastName}`.trim();

    const userId = req.user.id;
    const commentId = req.resolvedComment?.id!;
    const cardId = req.resolvedComment?.cardId!;
    const projectId = req.resolvedComment?.projectId!;
    const boardId = req.resolvedComment?.boardId!;
    const role = req.workspace?.role!;

    const comment = await CommentService.deleteComment(
      userId,
      actorName,
      projectId,
      commentId,
      cardId,
      boardId,
      role
    );

    res.json(new ApiResponse(200, 'Comment deleted successfully', comment));
  }
}
