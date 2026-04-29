import { and, countDistinct, eq, inArray, ne } from 'drizzle-orm';
import { db } from '../config/db';
import { usersTable, workspaceMembershipsTable } from '../db';
import { ApiError } from '../utils/api-response';

export class UserService {
  static async getMe(userId: string) {
    const [user] = await db
      .select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
        avatarUrl: usersTable.avatarUrl,
        role: workspaceMembershipsTable.role,
      })
      .from(usersTable)
      .innerJoin(
        workspaceMembershipsTable,
        eq(usersTable.id, workspaceMembershipsTable.userId)
      )
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) throw new ApiError(404, 'User not found');

    return user;
  }

  static async getAllTeamMembersCount(userId: string) {
    const userWorkspaceIds = db
      .select({ workspaceId: workspaceMembershipsTable.workspaceId })
      .from(workspaceMembershipsTable)
      .where(eq(workspaceMembershipsTable.userId, userId));

    const [result] = await db
      .select({
        total: countDistinct(workspaceMembershipsTable.userId),
      })
      .from(workspaceMembershipsTable)
      .where(
        and(
          inArray(workspaceMembershipsTable.workspaceId, userWorkspaceIds),
          ne(workspaceMembershipsTable.userId, userId)
        )
      );

    return result?.total;
  }
}
