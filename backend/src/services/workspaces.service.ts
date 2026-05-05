import { and, countDistinct, eq, gt, isNull, sql } from 'drizzle-orm';
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
import { tempTokens } from '../utils/tokens.util';
import type {
  CreateWP,
  SendInvite,
  UpdateWP,
} from '../validations/workspaces.validation';

export class WorkspaceService {
  private static async checkExistingSlug(slug: string) {
    const [existingSlug] = await db
      .select({ slug: workspacesTable.slug })
      .from(workspacesTable)
      .where(eq(workspacesTable.slug, slug))
      .limit(1);

    if (existingSlug)
      throw new ApiError(
        409,
        'This URL slug is already taken. Please use a different slug'
      );
  }

  static async createWorkspace(userId: string, data: CreateWP) {
    const { name, slug, colour } = data;

    await WorkspaceService.checkExistingSlug(slug);

    const { workspace, membership } = await db.transaction(async (tx) => {
      const [workspace] = await tx
        .insert(workspacesTable)
        .values({
          name,
          slug,
          colour,
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
          role: 'Owner',
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
      colour: workspace.colour,
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
        colour: workspacesTable.colour,
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
          'id', ${usersTable.id},
          'firstName', ${usersTable.firstName},
          'lastName', ${usersTable.lastName},
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
        colour: workspacesTable.colour,
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

  static async updateWorkspace(workspaceId: string, data: UpdateWP) {
    if (data.slug) await WorkspaceService.checkExistingSlug(data.slug);

    const [updatedWorkspace] = await db
      .update(workspacesTable)
      .set({ name: data.name, slug: data.slug })
      .where(eq(workspacesTable.id, workspaceId))
      .returning();

    if (!updatedWorkspace) {
      throw new ApiError(500, 'Error updating workspace. Please try again');
    }

    return {
      name: updatedWorkspace.name,
      slug: updatedWorkspace.slug,
    };
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
        joinedAt: workspaceMembershipsTable.joinedAt,
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
    console.log('userId:', userId);
    console.log('wpId:', workspaceId);

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

    if (member.role === 'Owner') {
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
    data: SendInvite,
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
          eq(usersTable.email, data.email)
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
          eq(workspaceInvitationsTable.email, data.email),
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
        email: data.email,
        role: data.role,
        tokenHash,
        expiresAt,
      })
      .returning();

    if (!invite) {
      throw new ApiError(500, 'Error creating invite. Please try again later');
    }

    await queueEmail({
      type: 'invitation',
      user: { email: data.email },
      inviterName,
      workspaceName,
      link: `${env.FRONTEND_URL}/invite/accept?token=${token}`,
    });
  }

  static async getPendingInvites(workspaceId: string) {
    const pendingInvites = await db
      .select({
        id: workspaceInvitationsTable.id,
        email: workspaceInvitationsTable.email,
        invitedBy: workspaceInvitationsTable.invitedBy,
        role: workspaceInvitationsTable.role,
        createdAt: workspaceInvitationsTable.createdAt,
      })
      .from(workspaceInvitationsTable)
      .where(
        and(
          eq(workspaceInvitationsTable.workspaceId, workspaceId),
          gt(workspaceInvitationsTable.expiresAt, new Date()),
          isNull(workspaceInvitationsTable.acceptedAt)
        )
      );

    return pendingInvites;
  }

  static async revokeInvite(workspaceId: string, email: string) {
    await db
      .delete(workspaceInvitationsTable)
      .where(
        and(
          eq(workspaceInvitationsTable.workspaceId, workspaceId),
          eq(workspaceInvitationsTable.email, email)
        )
      );

    return;
  }

  static async resendInvite(
    workspaceId: string,
    email: string,
    inviterName: string,
    workspaceName: string
  ) {
    const { token, tokenHash, expiresAt } = tempTokens();

    const [updatedInvite] = await db
      .update(workspaceInvitationsTable)
      .set({
        createdAt: new Date(),
        tokenHash,
        expiresAt,
      })
      .where(
        and(
          eq(workspaceInvitationsTable.workspaceId, workspaceId),
          eq(workspaceInvitationsTable.email, email)
        )
      )
      .returning();

    if (!updatedInvite) throw new Error('Invitation not found');

    await queueEmail({
      type: 'invitation',
      user: { email },
      inviterName,
      workspaceName,
      link: `${env.FRONTEND_URL}/invite/accept?token=${token}`,
    });

    return { success: true };
  }
}
