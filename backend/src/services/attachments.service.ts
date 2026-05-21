import { eq } from 'drizzle-orm';
import { cloudinary } from '../config/cloudinary';
import { db } from '../config/db';
import { attachmentsTable, boardsTable, cardsTable } from '../db';
import { emitBoardEvent } from '../socket/emitter';
import { ApiError } from '../utils/api-response';
import { ActivityService } from './activity.service';

export class AttachmentsService {
  static async uploadAttachment(
    actorName: string,
    boardId: string,
    projectId: string,
    cardId: string,
    userId: string,
    file: Express.Multer.File
  ) {
    const getResourceType = (mimetype: string) => {
      if (mimetype.startsWith('image/')) return 'image';
      if (mimetype.startsWith('video/')) return 'video';
      return 'raw';
    };

    const uploaded = await new Promise<{
      secure_url: string;
      public_id: string;
      bytes: number;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'switch/attachments',
          resource_type: getResourceType(file.mimetype),
        },
        (error, result) => {
          if (error || !result)
            return reject(
              new ApiError(500, 'Upload failed. Please try again.')
            );
          resolve(result);
        }
      );

      stream.end(file.buffer);
    });

    const resourceType = getResourceType(file.mimetype);

    try {
      const attachment = await db.transaction(async (tx) => {
        const [inserted] = await tx
          .insert(attachmentsTable)
          .values({
            cardId,
            userId,
            fileName: file.originalname,
            fileUrl: uploaded.secure_url,
            resourceType,
            publicId: uploaded.public_id,
            fileSize: uploaded.bytes,
            mimeType: file.mimetype,
          })
          .returning();

        if (!inserted) {
          throw new ApiError(500, 'Error saving attachment. Please try again.');
        }

        await ActivityService.log(
          {
            type: 'attachment_added',
            userId,
            projectId,
            cardId,
            metadata: { name: inserted.fileName },
          },
          tx
        );

        return inserted;
      });

      const { title } = await AttachmentsService.getCardAndBoardDetails(cardId);

      emitBoardEvent(boardId, 'attachment:uploaded', {
        cardId,
        attachment,
        actorId: userId,
        actorName,
        cardTitle: title,
      });

      return {
        id: attachment.id,
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        userId: attachment.userId,
        createdAt: attachment.createdAt,
      };
    } catch (error) {
      await cloudinary.uploader
        .destroy(uploaded.public_id, {
          resource_type: resourceType,
        })
        .catch((err) =>
          console.error('Failed to cleanup Cloudinary file:', err)
        );

      throw error;
    }
  }

  static async deleteAttachment(
    actorName: string,
    projectId: string,
    cardId: string,
    attachmentId: string,
    userId: string,
    role: string
  ) {
    const [attachment] = await db
      .select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.id, attachmentId))
      .limit(1);

    if (!attachment) throw new ApiError(404, 'Attachment not found.');

    const canDelete =
      attachment.userId === userId || ['Owner', 'Admin'].includes(role);

    if (!canDelete)
      throw new ApiError(403, 'You cannot delete this attachment.');

    await cloudinary.uploader.destroy(attachment.publicId, {
      resource_type: attachment.resourceType,
    });

    await db
      .delete(attachmentsTable)
      .where(eq(attachmentsTable.id, attachmentId));

    await ActivityService.log({
      type: 'attachment_removed',
      userId,
      projectId,
      cardId,
      metadata: { name: attachment.fileName },
    });

    const { boardId, title } =
      await AttachmentsService.getCardAndBoardDetails(cardId);

    emitBoardEvent(boardId, 'attachment:deleted', {
      cardId,
      attachmentId,
      actorId: userId,
      actorName,
      cardTitle: title,
    });

    return { message: 'Attachment deleted successfully.' };
  }

  private static async getCardAndBoardDetails(cardId: string) {
    const [result] = await db
      .select({
        boardId: cardsTable.boardId,
        title: cardsTable.title,
      })
      .from(cardsTable)
      .innerJoin(boardsTable, eq(cardsTable.boardId, boardsTable.id))
      .where(eq(cardsTable.id, cardId))
      .limit(1);

    if (!result) throw new ApiError(500, 'Error fatching Card or Board Detail');

    return result;
  }
}
