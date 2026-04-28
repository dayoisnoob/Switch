import { db } from '../config/db';
import { activitiesTable, activityTypeEnum, usersTable } from '../db';
import { logger } from '../config/logger';
import { desc, eq } from 'drizzle-orm';

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

  static async getLogs(cardId: string) {
    const activities = await db
      .select({
        id: activitiesTable.id,
        type: activitiesTable.type,
        metadata: activitiesTable.metadata,
        createdAt: activitiesTable.createdAt,
        user: {
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          avatarUrl: usersTable.avatarUrl,
        },
      })
      .from(activitiesTable)
      .leftJoin(usersTable, eq(activitiesTable.userId, usersTable.id))
      .where(eq(activitiesTable.cardId, cardId))
      .orderBy(desc(activitiesTable.createdAt));

    return activities;
  }
}
