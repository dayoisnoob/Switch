import type { Response } from 'express';
import { AttachmentsService } from '../services/attachments.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiError, ApiResponse } from '../utils/api-response';
import { getActorName } from '../utils/helpers';

export class AttachmentsController {
  static async uploadAttachment(req: AuthenticatedRequest, res: Response) {
    const actorName = getActorName(req.user);

    const userId = req.user.id;
    const cardId = req.resolvedCard!.id;
    const projectId = req.resolvedCard!.projectId;
    const boardId = req.resolvedCard!.boardId;

    if (!req.file) throw new ApiError(400, 'No file provided.');

    const attachment = await AttachmentsService.uploadAttachment(
      actorName,
      boardId,
      projectId,
      cardId,
      userId,
      req.file
    );

    res
      .status(201)
      .json(new ApiResponse(201, 'File uploaded successfully.', attachment));
  }

  static async deleteAttachment(req: AuthenticatedRequest, res: Response) {
    const actorName = getActorName(req.user);

    const userId = req.user.id;
    const role = req.workspace?.role!;

    const attachmentId = req.params.attachmentId as string;
    const projectId = req.resolvedAttachment?.projectId!;
    const cardId = req.resolvedAttachment?.cardId!;

    const result = await AttachmentsService.deleteAttachment(
      actorName,
      projectId,
      cardId,
      attachmentId,
      userId,
      role
    );

    res.json(new ApiResponse(200, result.message));
  }
}
