import { Queue, Worker, Job } from 'bullmq';
import { sendMail } from '../config/email';
import { logger } from '../config/logger';
import { bullMQConnection, redis } from '../config/redis';

export interface EmailJob {
  user: { firstName: string; email: string };
  link: string;
  type: 'welcome' | 'accountDeletion';
}

export const emailQueue = new Queue<EmailJob>('emails', {
  connection: bullMQConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const emailWorker = new Worker<EmailJob>(
  'emails',
  async (job: Job<EmailJob>) => {
    const { user, link, type } = job.data;
    await sendMail(user, link, type);
    logger.info(
      { email: user.email, type, jobId: job.id },
      'Email job completed'
    );
  },
  {
    connection: bullMQConnection,
    drainDelay: 300,
    stalledInterval: 60000,
  }
);

emailWorker.on('failed', (job, err) => {
  logger.error(
    { jobId: job?.id, email: job?.data.user.email, err },
    'Email job failed'
  );
});

emailWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Email job succeeded');
});

export const queueEmail = async (data: EmailJob) => {
  await emailQueue.add(data.type, data);
};
