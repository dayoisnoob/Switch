import type { Response } from 'express';
import { CommentService } from '../services/comments.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../utils/api-response';

export class CommentController {
  static async createComment(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id!;
    const cardId = req.resolvedCard?.id!;

    const comment = await CommentService.createComment(
      userId,
      cardId,
      req.body
    );

    res
      .status(201)
      .json(new ApiResponse(200, 'Comment added successfully', comment));
  }

  static async editComment(req: AuthenticatedRequest, res: Response) {
    const commentId = req.resolvedComment?.id!;
    const cardId = req.resolvedComment?.cardId!;
    const userId = req.user.id;

    const comment = await CommentService.editComment(
      userId,
      commentId,
      cardId,
      req.body
    );

    res.json(new ApiResponse(200, 'Comment edited successfully', comment));
  }

  static async deleteComment(req: AuthenticatedRequest, res: Response) {
    const commentId = req.resolvedComment?.id!;
    const userId = req.resolvedComment?.userId!;
    const cardId = req.resolvedComment?.cardId!;
    const role = req.workspace?.role!;

    const comment = await CommentService.deleteComment(
      userId,
      commentId,
      cardId,
      role
    );

    res.json(new ApiResponse(200, 'Comment deleted successfully', comment));
  }
}
