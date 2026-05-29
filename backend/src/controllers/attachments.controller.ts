import type { Response } from 'express';
import { AttachmentsService } from '../services/attachments.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiError, ApiResponse } from '../utils/api-response';
import { getActorName } from '../utils/helpers';
import { env } from '../config/env';
import { cloudinary } from '../config/cloudinary';

export class AttachmentsController {
  static async getSignature(req: AuthenticatedRequest, res: Response) {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'switch/attachments';

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      env.CLOUDINARY_API_SECRET
    );

    res.json(
      new ApiResponse(200, 'Signature generated', {
        signature,
        timestamp,
        folder,
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        apiKey: env.CLOUDINARY_API_KEY,
      })
    );
  }

  static async uploadAttachment(req: AuthenticatedRequest, res: Response) {
    const actorName = getActorName(req.user);
    const userId = req.user.id;
    const cardId = req.resolvedCard!.id;
    const projectId = req.resolvedCard!.projectId;
    const boardId = req.resolvedCard!.boardId;

    const { fileUrl, publicId, fileName, fileSize, mimeType, resourceType } =
      req.body;

    if (!fileUrl || !publicId || !fileName) {
      throw new ApiError(400, 'Missing file details.');
    }

    const attachment = await AttachmentsService.uploadAttachment(
      actorName,
      boardId,
      projectId,
      cardId,
      userId,
      { fileUrl, publicId, fileName, fileSize, mimeType, resourceType }
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
