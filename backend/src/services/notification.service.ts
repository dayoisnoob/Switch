import { and, desc, eq } from 'drizzle-orm';
import { db } from '../config/db';
import { notificationsTable } from '../db';
import { ApiError } from '../utils/api-response';

export class NotificationService {
  static async getNotifications(userId: string) {
    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(20);

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
