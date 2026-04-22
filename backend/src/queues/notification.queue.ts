import { Queue, Worker, Job } from 'bullmq';
import { bullMQConnection } from '../config/redis';
import { logger } from '../config/logger';
import { db } from '../config/db';
import { notificationsTable } from '../db';

export interface NotificationJob {
  type: 'card_assigned' | 'comment_added' | 'card_due_soon' | 'mentioned';
  userId: string;
  title: string;
  body: string;
  entityId?: string;
  entityType?: string;
}

export const notificationQueue = new Queue<NotificationJob>('notifications', {
  connection: bullMQConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const notificationWorker = new Worker<NotificationJob>(
  'notifications',
  async (job: Job<NotificationJob>) => {
    const { type, userId, title, body, entityId, entityType } = job.data;

    await db.insert(notificationsTable).values({
      userId,
      type,
      title,
      body,
      entityId,
      entityType,
      isRead: false,
    });

    logger.info({ userId, type, jobId: job.id }, 'Notification created');
  },
  { connection: bullMQConnection }
);

notificationWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'Notification job failed');
});

export const queueNotification = async (data: NotificationJob) => {
  await notificationQueue.add(data.type, data);
};
