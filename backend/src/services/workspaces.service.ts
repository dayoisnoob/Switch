import {
  and,
  count,
  countDistinct,
  eq,
  gt,
  inArray,
  isNull,
  ne,
  sql,
} from 'drizzle-orm';
import { db } from '../config/db';
import { env } from '../config/env';
import {
  projectsTable,
  usersTable,
  workspaceInvitationsTable,
  workspaceMembershipsTable,
  workspacesTable,
} from '../db';
import { queueEmail } from '../queues/email.queue';
import { ApiError } from '../utils/api-response';
import { slugGen } from '../utils/helpers';
import { tempTokens } from '../utils/tokens.util';
import { alias } from 'drizzle-orm/pg-core';

export class WorkspaceService {
  static async createWorkspace(userId: string, name: string) {
    const slug = slugGen(name, 'workspace');

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

    const flattenedData = {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.ownerId,
      role: membership.role,
    };

    return flattenedData;
  }

  static async getWorkspace(workspaceId: string) {
    const [workspace] = await db
      .select({
        id: workspacesTable.id,
        name: workspacesTable.name,
        slug: workspacesTable.slug,
        ownerId: workspacesTable.ownerId,
        role: workspaceMembershipsTable.role,
      })
      .from(workspacesTable)
      .innerJoin(
        workspaceMembershipsTable,
        eq(workspacesTable.id, workspaceMembershipsTable.workspaceId)
      )
      .where(eq(workspacesTable.id, workspaceId))
      .limit(1);

    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    return workspace;
  }

  static async getAllWorkspaces(userId: string) {
    const projectCount = db
      .select({
        workspaceId: projectsTable.workspaceId,
        count: countDistinct(projectsTable.id).as('projectCount'),
      })
      .from(projectsTable)
      .groupBy(projectsTable.workspaceId)
      .as('projects_count');

    const memberCount = db
      .select({
        workspaceId: workspaceMembershipsTable.workspaceId,
        count: countDistinct(workspaceMembershipsTable.id).as('memberCount'),
      })
      .from(workspaceMembershipsTable)
      .groupBy(workspaceMembershipsTable.workspaceId)
      .as('member_count');

    const members = db
      .select({
        workspaceId: workspaceMembershipsTable.workspaceId,
        members: sql<{ name: string; avatarUrl: string | null }[]>`
      json_agg(
        distinct jsonb_build_object(
          'name', ${usersTable.firstName},
          'avatarUrl', ${usersTable.avatarUrl}
        )
      )
    `.as('members'),
      })
      .from(workspaceMembershipsTable)
      .leftJoin(usersTable, eq(workspaceMembershipsTable.userId, usersTable.id))
      .groupBy(workspaceMembershipsTable.workspaceId)
      .as('members');

    const workspaces = await db
      .select({
        id: workspacesTable.id,
        name: workspacesTable.name,
        slug: workspacesTable.slug,
        ownerId: workspacesTable.ownerId,
        role: workspaceMembershipsTable.role,
        projectsCount: projectCount.count,
        membersCount: memberCount.count,
        members: members.members,
      })
      .from(workspacesTable)
      .innerJoin(
        workspaceMembershipsTable,
        eq(workspacesTable.id, workspaceMembershipsTable.workspaceId)
      )
      .leftJoin(projectCount, eq(workspacesTable.id, projectCount.workspaceId))
      .leftJoin(memberCount, eq(workspacesTable.id, memberCount.workspaceId))
      .leftJoin(members, eq(workspacesTable.id, members.workspaceId))
      .where(eq(workspaceMembershipsTable.userId, userId));

    return workspaces;
  }

  static async updateWorkspace(name: string, workspaceId: string) {
    const [updatedWorkspace] = await db
      .update(workspacesTable)
      .set({ name })
      .where(eq(workspacesTable.id, workspaceId))
      .returning();

    if (!updatedWorkspace) {
      throw new ApiError(500, 'Error updating workspace. Please try again');
    }

    return updatedWorkspace;
  }

  static async deleteWorkspace(userId: string, workspaceId: string) {
    const [workspace] = await db
      .select({ ownerId: workspacesTable.ownerId })
      .from(workspacesTable)
      .where(eq(workspacesTable.id, workspaceId))
      .limit(1);

    if (!workspace) throw new ApiError(404, 'Workspace not found');

    if (workspace.ownerId !== userId) {
      throw new ApiError(
        403,
        'Only the workspace owner can delete this workspace'
      );
    }
    await db.delete(workspacesTable).where(eq(workspacesTable.id, workspaceId));

    return;
  }

  static async getWorkspaceMembers(userId: string, workspaceId: string) {
    const members = await db
      .select({
        id: workspaceMembershipsTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        avatarUrl: usersTable.avatarUrl,
        role: workspaceMembershipsTable.role,
        userId: workspaceMembershipsTable.userId,
      })
      .from(workspaceMembershipsTable)
      .innerJoin(
        usersTable,
        eq(workspaceMembershipsTable.userId, usersTable.id)
      )
      .where(eq(workspaceMembershipsTable.workspaceId, workspaceId));

    return members;
  }

  static async removeMember(userId: string, workspaceId: string) {
    const [member] = await db
      .select()
      .from(workspaceMembershipsTable)
      .where(
        and(
          eq(workspaceMembershipsTable.workspaceId, workspaceId),
          eq(workspaceMembershipsTable.userId, userId)
        )
      );

    if (!member) {
      throw new ApiError(404, 'This member does not exist in this workspace.');
    }

    if (member.role === 'owner') {
      throw new ApiError(403, 'You cannot remove the owner of this workspace.');
    }

    const [deletedMember] = await db
      .delete(workspaceMembershipsTable)
      .where(
        and(
          eq(workspaceMembershipsTable.workspaceId, workspaceId),
          eq(workspaceMembershipsTable.userId, userId)
        )
      )
      .returning();

    if (!deletedMember) {
      throw new ApiError(500, 'Error deleting this member. Please try again.');
    }

    return;
  }

  static async sendInvitation(
    userId: string,
    email: string,
    workspaceId: string,
    inviterName: string,
    workspaceName: string
  ) {
    const [existingMember] = await db
      .select({
        id: workspaceMembershipsTable.id,
      })
      .from(workspaceMembershipsTable)
      .innerJoin(
        usersTable,
        eq(workspaceMembershipsTable.userId, usersTable.id)
      )
      .where(
        and(
          eq(workspaceMembershipsTable.workspaceId, workspaceId),
          eq(usersTable.email, email)
        )
      )
      .limit(1);

    if (existingMember) {
      throw new ApiError(
        409,
        'This user is already a member of this workspace.'
      );
    }

    const [pending] = await db
      .select({
        id: workspaceInvitationsTable.id,
      })
      .from(workspaceInvitationsTable)
      .where(
        and(
          eq(workspaceInvitationsTable.workspaceId, workspaceId),
          eq(workspaceInvitationsTable.email, email),
          gt(workspaceInvitationsTable.expiresAt, new Date()),
          isNull(workspaceInvitationsTable.acceptedAt)
        )
      )
      .limit(1);

    if (pending) {
      throw new ApiError(
        409,
        'A pending invite already exists for this email.'
      );
    }

    const { token, tokenHash, expiresAt } = tempTokens();

    const [invite] = await db
      .insert(workspaceInvitationsTable)
      .values({
        workspaceId,
        invitedBy: userId,
        email,
        tokenHash,
        expiresAt,
      })
      .returning();

    if (!invite) {
      throw new ApiError(500, 'Error creating invite. Please try again later');
    }

    await queueEmail({
      type: 'invitation',
      user: { email },
      inviterName,
      workspaceName,
      link: `${env.FRONTEND_URL}/invite/accept?token=${token}`,
    });
  }
}
