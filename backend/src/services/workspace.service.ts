import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '../config/db';
import {
  usersTable,
  workspaceInvitationsTable,
  workspaceMembershipsTable,
  workspacesTable,
} from '../db';
import { workspaceSlugGen } from '../utils/helpers';
import { ApiError } from '../utils/api-response';
import { tempTokens } from '../utils/tokens.util';
import { queueEmail } from '../queues/email.queue';
import { env } from '../config/env';
import { cryptoHash } from '../utils/hash.util';
import { AuthService } from './auth.service';

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

  static async getWorkspace(workspaceId: string) {
    const [workspace] = await db
      .select({
        id: workspacesTable.id,
        name: workspacesTable.name,
        slug: workspacesTable.slug,
        ownerId: workspacesTable.ownerId,
        createdAt: workspacesTable.createdAt,
      })
      .from(workspacesTable)
      .where(eq(workspacesTable.id, workspaceId))
      .limit(1);

    if (!workspace) {
      throw new ApiError(404, 'Workspace not found');
    }

    return workspace;
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

  static async getMembers(userId: string, workspaceId: string) {
    const members = await db
      .select({
        id: workspaceMembershipsTable.id,
        email: usersTable.email,
        role: workspaceMembershipsTable.role,
        joinedAt: workspaceMembershipsTable.joinedAt,
      })
      .from(workspaceMembershipsTable)
      .innerJoin(
        usersTable,
        eq(workspaceMembershipsTable.userId, usersTable.id)
      )
      .where(eq(workspaceMembershipsTable.workspaceId, workspaceId));

    return members;
  }

  static async removeMember(memberId: string, workspaceId: string) {
    const [member] = await db
      .select()
      .from(workspaceMembershipsTable)
      .where(
        and(
          eq(workspaceMembershipsTable.workspaceId, workspaceId),
          eq(workspaceMembershipsTable.userId, memberId)
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
      .where(eq(workspaceMembershipsTable.userId, memberId))
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

  static async acceptInvitation(token: string) {
    const tokenHash = cryptoHash(token);

    const [validToken] = await db
      .select({
        acceptedAt: workspaceInvitationsTable.acceptedAt,
        email: workspaceInvitationsTable.email,
        workspaceId: workspaceInvitationsTable.workspaceId,
      })
      .from(workspaceInvitationsTable)
      .where(
        and(
          eq(workspaceInvitationsTable.tokenHash, tokenHash),
          gt(workspaceInvitationsTable.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!validToken) {
      throw new ApiError(
        403,
        'You have used an invalid or expired link. Please request a new invite.'
      );
    }
    if (validToken.acceptedAt) {
      throw new ApiError(409, 'You have already accepted this invitation.');
    }

    const existing = await AuthService.findUserByIdentifier(
      validToken.email,
      'email'
    );

    if (!existing) {
      return {
        message: 'Invitee does now own an account. Please register first.',
        token,
      };
    }

    await db.transaction(async (tx) => {
      const [membership] = await tx
        .insert(workspaceMembershipsTable)
        .values({
          workspaceId: validToken.workspaceId,
          userId: existing.id,
        })
        .returning();

      if (!membership) {
        throw new ApiError(
          500,
          'Error creating workspace membership, please try again'
        );
      }

      await tx
        .update(workspaceInvitationsTable)
        .set({
          acceptedAt: new Date(),
        })
        .returning();
    });

    return;
  }
}
