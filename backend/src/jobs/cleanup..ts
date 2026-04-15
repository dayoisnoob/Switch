import { eq, lt, or } from 'drizzle-orm';
import cron from 'node-cron';
import { db } from '../config/db';
import { logger } from '../config/logger';
import { refreshTokensTable } from '../db';

const cleanExpiredRefreshTokens = async () => {
  try {
    const result = await db
      .delete(refreshTokensTable)
      .where(
        or(
          eq(refreshTokensTable.isRevoked, true),
          lt(refreshTokensTable.expiresAt, new Date())
        )
      )
      .returning({ id: refreshTokensTable.id });

    logger.info({ deleted: result.length }, 'Cleaned expired refresh tokens');
  } catch (err) {
    logger.error({ err }, 'Failed to clean refresh tokens');
  }
};

export const registerCleanupJobs = () => {
  cron.schedule('0 2 * * *', async () => {
    logger.info('Running nightly token cleanup');
    await cleanExpiredRefreshTokens();
  });

  logger.info('Cleanup jobs registered');
};
