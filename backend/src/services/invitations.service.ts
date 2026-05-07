import { and, eq, gt } from 'drizzle-orm';
import { db } from '../config/db';
import {
  usersTable,
  workspaceInvitationsTable,
  workspaceMembershipsTable,
  workspacesTable,
} from '../db';
import { ApiError } from '../utils/api-response';
import { cryptoHash } from '../utils/hash.util';

export class InvitationsService {
  static async verifyInvitation(token: string) {
    const tokenHash = cryptoHash(token);

    const [invite] = await db
      .select({
        workspaceName: workspacesTable.name,
        workspaceSlug: workspacesTable.slug,
        inviterFirstName: usersTable.firstName,
        inviterLastName: usersTable.lastName,
        email: workspaceInvitationsTable.email,
        acceptedAt: workspaceInvitationsTable.acceptedAt,
        expiresAt: workspaceInvitationsTable.expiresAt,
      })
      .from(workspaceInvitationsTable)
      .innerJoin(
        workspacesTable,
        eq(workspaceInvitationsTable.workspaceId, workspacesTable.id)
      )
      .leftJoin(
        usersTable,
        eq(workspaceInvitationsTable.invitedBy, usersTable.id)
      )
      .where(eq(workspaceInvitationsTable.tokenHash, tokenHash))
      .limit(1);

    if (!invite) throw new ApiError(404, 'Invitation not found.');
    if (invite.acceptedAt)
      throw new ApiError(409, 'Invitation already accepted.');
    if (invite.expiresAt < new Date())
      throw new ApiError(403, 'Invitation expired.');

    return {
      workspaceName: invite.workspaceName,
      workspaceSlug: invite.workspaceSlug,
      inviterName:
        `${invite.inviterFirstName} ${invite.inviterLastName}`.trim(),
      email: invite.email,
    };
  }
  static async acceptInvitation(email: string | null, token: string) {
    const tokenHash = cryptoHash(token);

    const [validToken] = await db
      .select({
        acceptedAt: workspaceInvitationsTable.acceptedAt,
        email: workspaceInvitationsTable.email,
        role: workspaceInvitationsTable.role,
        workspaceId: workspaceInvitationsTable.workspaceId,
        workspaceSlug: workspacesTable.slug,
      })
      .from(workspaceInvitationsTable)
      .innerJoin(
        workspacesTable,
        eq(workspaceInvitationsTable.workspaceId, workspacesTable.id)
      )
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

    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, validToken.email))
      .limit(1);

    if (!existing) {
      return { requiresRegistration: true, token: token };
    }

    const [alreadyMember] = await db
      .select({ id: workspaceMembershipsTable.id })
      .from(workspaceMembershipsTable)
      .where(
        and(
          eq(workspaceMembershipsTable.workspaceId, validToken.workspaceId),
          eq(workspaceMembershipsTable.userId, existing.id)
        )
      )
      .limit(1);

    if (alreadyMember) {
      throw new ApiError(409, 'You are already a member of this workspace.');
    }

    if (!email) {
      return { requiresLogin: true };
    }

    if (validToken.email !== email) {
      throw new ApiError(403, 'You cannot accept this invitation.');
    }

    await db.transaction(async (tx) => {
      const [membership] = await tx
        .insert(workspaceMembershipsTable)
        .values({
          workspaceId: validToken.workspaceId,
          userId: existing.id,
          role: validToken.role,
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
        .where(eq(workspaceInvitationsTable.tokenHash, tokenHash))
        .returning();
    });

    return {
      message: 'Invitation accepted successfully',
      workspaceSlug: validToken.workspaceSlug,
    };
  }
}
