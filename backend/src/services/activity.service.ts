import { db } from '../config/db';
import { activitiesTable, activityTypeEnum } from '../db';
import { logger } from '../config/logger';

interface LogActivityInput {
  type: (typeof activityTypeEnum.enumValues)[number];
  userId: string;
  projectId: string;
  cardId?: string;
  metadata?: Record<string, unknown>;
}

export class ActivityService {
  static async log(input: LogActivityInput) {
    try {
      await db.insert(activitiesTable).values(input);
    } catch (err) {
      logger.error({ err, input }, 'Failed to log activity');
    }
  }
}
