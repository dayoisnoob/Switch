import { eq } from 'drizzle-orm';
import { cloudinary } from '../config/cloudinary';
import { db } from '../config/db';
import { attachmentsTable } from '../db';
import { ApiError } from '../utils/api-response';
import { ActivityService } from './activity.service';

export class AttachmentsService {
  static async uploadAttachment(
    projectId: string,
    cardId: string,
    userId: string,
    file: Express.Multer.File
  ) {
    const uploaded = await new Promise<{
      secure_url: string;
      public_id: string;
      bytes: number;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'switch/attachments',
          resource_type: 'auto',
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

    const getResourceType = (mimeType: string): 'image' | 'raw' => {
      if (mimeType.startsWith('image/')) return 'image';
      return 'raw';
    };

    const [attachment] = await db
      .insert(attachmentsTable)
      .values({
        cardId,
        userId,
        fileName: file.originalname,
        fileUrl: uploaded.secure_url,
        resourceType: getResourceType(file.mimetype),
        publicId: uploaded.public_id,
        fileSize: uploaded.bytes,
        mimeType: file.mimetype,
      })
      .returning();

    if (!attachment)
      throw new ApiError(500, 'Error saving attachment. Please try again.');

    await ActivityService.log({
      type: 'attachment_added',
      userId,
      projectId,
      cardId,
      metadata: { name: attachment.fileName },
    });

    return attachment;
  }

  static async deleteAttachment(
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
      attachment.userId === userId || ['owner', 'admin'].includes(role);

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

    return { message: 'Attachment deleted successfully.' };
  }
}
