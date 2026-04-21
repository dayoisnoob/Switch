import type { Response } from 'express';
import { LabelService } from '../services/label.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../utils/api-response';
import { getParam } from '../utils/params.util';
import { CommentService } from '../services/comment.service';

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
    const userId = req.resolvedComment?.userId!;
    const cardId = req.resolvedComment?.cardId!;

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

    res
      .status(201)
      .json(new ApiResponse(200, 'Comment deleted successfully', comment));
  }
}
