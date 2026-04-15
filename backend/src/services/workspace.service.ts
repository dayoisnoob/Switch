import { eq } from 'drizzle-orm';
import { db } from '../config/db';
import { workspaceMembershipsTable, workspacesTable } from '../db';
import { workspaceSlugGen } from '../utils/helpers';
import { ApiError } from '../utils/api-response';

export class WorkspaceService {
  static async createWorkspace(userId: string, name: string) {
    const slug = workspaceSlugGen(name);

    const { workspace, membership } = await db.transaction(async (tx) => {
      const [workspace] = await tx
        .insert(workspacesTable)
        .values({
          name,
          slug,
          ownerId: userId,
        })
        .returning();

      if (!workspace) {
        throw new ApiError(500, 'Error creating workspace, please try again');
      }

      const [membership] = await tx
        .insert(workspaceMembershipsTable)
        .values({
          workspaceId: workspace?.id,
          userId,
          role: 'owner',
        })
        .returning();

      if (!membership) {
        throw new ApiError(
          500,
          'Error creating workspace membership, please try again'
        );
      }

      return { workspace, membership };
    });

    return { workspace, membership };
  }

  static async getAllWorkspaces(userId: string) {
    const workspaces = await db
      .select({
        id: workspacesTable.id,
        name: workspacesTable.name,
        slug: workspacesTable.slug,
        ownerId: workspacesTable.ownerId,
        createdAt: workspacesTable.createdAt,
        role: workspaceMembershipsTable.role,
      })
      .from(workspacesTable)
      .innerJoin(
        workspaceMembershipsTable,
        eq(workspacesTable.id, workspaceMembershipsTable.workspaceId)
      )
      .where(eq(workspaceMembershipsTable.userId, userId));
    return workspaces;
  }
}
