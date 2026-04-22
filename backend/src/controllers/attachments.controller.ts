import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse, ApiError } from '../utils/api-response';
import { AttachmentsService } from '../services/attachments.service';
import { getParam } from '../utils/params.util';

export class AttachmentsController {
  static async uploadAttachment(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const cardId = req.resolvedCard?.id!;

    if (!req.file) throw new ApiError(400, 'No file provided.');

    const attachment = await AttachmentsService.uploadAttachment(
      cardId,
      userId,
      req.file
    );

    res
      .status(201)
      .json(new ApiResponse(201, 'File uploaded successfully.', attachment));
  }

  static async deleteAttachment(req: AuthenticatedRequest, res: Response) {
    const attachmentId = getParam(req.params.attachmentId, 'attachmentId');
    const userId = req.user.id;
    const role = req.workspace?.role!;

    const result = await AttachmentsService.deleteAttachment(
      attachmentId,
      userId,
      role
    );

    res.json(new ApiResponse(200, result.message));
  }
}
