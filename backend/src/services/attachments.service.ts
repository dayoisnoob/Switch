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
    file: {
      fileUrl: string;
      publicId: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      resourceType: string;
    }
  ) {
    const attachment = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(attachmentsTable)
        .values({
          cardId,
          userId,
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          resourceType: file.resourceType,
          publicId: file.publicId,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
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
