import { and, desc, eq } from 'drizzle-orm';
import { db } from '../config/db';
import { notificationsTable } from '../db';
import { ApiError } from '../utils/api-response';
import { logger } from '../config/logger';
import { emitToUser } from '../socket/emitter';

export class NotificationService {
  static async create(data: {
    type: 'card_assigned' | 'comment_added' | 'card_due_soon' | 'mentioned';
    userId: string;
    title: string;
    body: string;
    entityId?: string;
    entityType?: string;
  }) {
    try {
      const [notification] = await db
        .insert(notificationsTable)
        .values(data)
        .returning();

      emitToUser(data.userId, 'notification:new', { notification });
    } catch (err) {
      logger.error({ err }, 'Failed to create notification');
    }
  }
  static async getNotifications(userId: string, limit = 20, offset = 0) {
    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(limit)
      .offset(offset);

    return notifications;
  }

  static async markRead(notificationId: string, userId: string) {
    const [notification] = await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(
        and(
          eq(notificationsTable.id, notificationId),
          eq(notificationsTable.userId, userId)
        )
      )
      .returning();

    if (!notification) throw new ApiError(404, 'Notification not found.');
    return notification;
  }

  static async markAllRead(userId: string) {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(
        and(
          eq(notificationsTable.userId, userId),
          eq(notificationsTable.isRead, false)
        )
      );

    return;
  }
}
