import 'dotenv/config';
import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { registerCleanupJobs } from './jobs/cleanup.';
import { emailWorker } from './queues/email.queue';

const PORT = env.PORT || 7000;
const NODE_ENV = env.NODE_ENV;

const server = app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
  logger.info(`Working environment: ${NODE_ENV}`);
  registerCleanupJobs();
});

process.on('SIGTERM', async () => {
  logger.info('Sigterm received, shutting down gracefully');
  await emailWorker.close();
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SigIntreceived, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err);
  server.close(() => {
    process.exit(1);
  });
});
