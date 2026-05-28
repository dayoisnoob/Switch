import { Queue, Worker, Job } from 'bullmq';
import { sendMail } from '../config/email';
import { logger } from '../config/logger';
import { bullMQConnection } from '../config/redis';

export type EmailJob =
  | {
      type: 'welcome';
      user: { firstName: string; email: string };
      link: string;
    }
  | {
      type: 'accountDeletion';
      user: { firstName: string; email: string };
      link: string;
    }
  | { type: 'otp'; user: { firstName?: string; email: string }; code: string }
  | {
      type: 'passwordReset';
      user: { firstName?: string; email: string };
      link: string;
    }
  | {
      type: 'invitation';
      user: { firstName?: string; email: string };
      inviterName: string;
      workspaceName: string;
      link: string;
    };

export const emailQueue = new Queue<EmailJob>('emails', {
  connection: bullMQConnection,
  prefix: 'switch',
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
    const { user, type } = job.data;
    await sendMail(job.data);
    logger.info(
      { email: user.email, type, jobId: job.id },
      'Email job completed'
    );
  },
  {
    connection: bullMQConnection,
    prefix: 'switch',
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
