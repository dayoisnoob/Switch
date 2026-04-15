import { and, eq, gt } from 'drizzle-orm';
import { db } from '../config/db';

import { ApiError } from '../utils/api-response';
import { bcryptCompare, bcryptHash, cryptoHash } from '../utils/hash.util';

import { env } from '../config/env';
import { logger } from '../config/logger';
import { refreshTokensTable, usersTable } from '../db';
import { queueEmail } from '../queues/email.queue';
import { Tokens } from '../utils/tokens.util';
import type { updateInput } from '../validations/auth.validation';
import type { OAuthProfileInput } from '../types/auth.types';

export class AuthService {
  static async oAuthSignIn(userProfile: OAuthProfileInput) {
    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, userProfile.email))
      .limit(1);

    if (existingUser) {
      if (!existingUser?.isActive) {
        throw new ApiError(
          403,
          'Your account has been suspended. Please contact support.'
        );
      }

      const [userToLogin] = await db
        .update(usersTable)
        .set({
          avatarUrl: userProfile.avatarUrl || existingUser.avatarUrl,
          authProvider: userProfile.authProvider,
          providerId: userProfile.providerId,
          lastLogin: new Date(),
        })
        .where(eq(usersTable.id, existingUser.id))
        .returning();

      if (!userToLogin)
        throw new ApiError(500, 'Login failed. Please try again.');

      logger.info({ userId: userToLogin?.id }, 'User logged in via auth');

      return { user: userToLogin };
    }

    const [newUser] = await db
      .insert(usersTable)
      .values({
        email: userProfile.email,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        avatarUrl: userProfile.avatarUrl,
        authProvider: userProfile.authProvider,
        providerId: userProfile.providerId,
        lastLogin: new Date(),
      })
      .returning();

    if (!newUser) {
      throw new ApiError(
        500,
        'Registration failed. Please try again or contact support.'
      );
    }

    logger.info({ userId: newUser?.id }, 'New user registered via auth');

    const redirectLink = env.FRONTEND_URL;

    try {
      await queueEmail({
        user: { firstName: newUser.firstName, email: newUser.email },
        link: redirectLink,
        type: 'welcome',
      });
    } catch (err) {
      logger.error(
        { userId: newUser.id, err },
        'Failed to queue verification email'
      );
    }

    return { user: newUser };
  }

  static async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw new ApiError(401, 'Authentication required. Please sign in.');
    }

    const hashedToken = cryptoHash(refreshToken);

    const [storedToken] = await db
      .select()
      .from(refreshTokensTable)
      .where(
        and(
          eq(refreshTokensTable.tokenHash, hashedToken),
          eq(refreshTokensTable.isRevoked, false),
          gt(refreshTokensTable.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!storedToken) {
      throw new ApiError(401, 'Session expired. Please sign in again.');
    }

    if (storedToken.rotatedAt) {
      logger.warn(
        {
          tokenId: storedToken.id,
          familyId: storedToken.tokenFamilyId,
          userId: storedToken.userId,
          rotatedAt: storedToken.rotatedAt,
          attemptedAt: new Date(),
        },
        'Token reuse detected!!'
      );

      await AuthService.revokeTokenFamily(storedToken.tokenFamilyId);

      throw new ApiError(
        401,
        'Security violation detected. Please login again'
      );
    }

    const [user] = await db
      .select({
        id: usersTable.id,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
        role: usersTable.role,
        isActive: usersTable.isActive,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.id, storedToken.userId),
          eq(usersTable.isActive, true)
        )
      )
      .limit(1);

    if (!user) {
      await AuthService.revokeTokenFamily(storedToken.tokenFamilyId);
      throw new ApiError(401, 'Session expired. Please sign in again.');
    }

    const result = await db.transaction(async (tx) => {
      await tx
        .update(refreshTokensTable)
        .set({ rotatedAt: new Date(), isRevoked: true, revokedAt: new Date() })
        .where(eq(refreshTokensTable.id, storedToken.id));

      return await Tokens.generateAuthTokens(
        user,
        storedToken.tokenFamilyId,
        tx
      );
    });

    logger.info({ userId: user.id }, 'Token refreshed');

    return result;
  }

  static async logout(refreshToken: string) {
    const hashedToken = cryptoHash(refreshToken);

    const [deletedToken] = await db
      .update(refreshTokensTable)
      .set({ isRevoked: true, revokedAt: new Date() })
      .where(eq(refreshTokensTable.tokenHash, hashedToken))
      .returning({ userId: refreshTokensTable.userId });

    if (deletedToken) {
      logger.info(
        {
          userId: deletedToken.userId,
        },
        'User logged out'
      );
    }

    return { message: 'Logout successful' };
  }

  static async logoutAll(userId: string) {
    await db
      .update(refreshTokensTable)
      .set({ isRevoked: true, revokedAt: new Date() })
      .where(eq(refreshTokensTable.userId, userId))
      .returning({ userId: refreshTokensTable.userId });

    logger.info(
      {
        userId,
      },
      'User logged out from all devices'
    );

    return { message: 'Logout successful' };
  }

  static async updateUser(userId: string, data: updateInput) {
    const [updatedUser] = await db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, userId))
      .returning({
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
      });

    if (!updatedUser) {
      throw new ApiError(500, 'Error updating user');
    }

    return updatedUser;
  }

  static async deleteUser(userId: string) {
    const [existing] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
      })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!existing) {
      throw new ApiError(404, 'User not found');
    }

    const deletedUser = await db.transaction(async (tx) => {
      const [deletedUser] = await tx
        .update(usersTable)
        .set({
          isActive: false,
          deletedAt: new Date(),
          email: `deleted_${existing.id}@deleted.com`,
        })
        .where(eq(usersTable.id, userId))
        .returning();

      await tx
        .delete(refreshTokensTable)
        .where(eq(refreshTokensTable.userId, userId));

      return deletedUser;
    });

    if (!deletedUser) {
      throw new ApiError(500, 'Error deleting user');
    }
    const link = `${env.FRONTEND_URL}/`;

    await queueEmail({
      user: { firstName: existing.firstName, email: existing.email },
      link: link,
      type: 'accountDeletion',
    });

    return;
  }

  static async revokeTokenFamily(tokenFamilyId: string) {
    const result = await db
      .update(refreshTokensTable)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
      })
      .where(eq(refreshTokensTable.tokenFamilyId, tokenFamilyId))
      .returning();

    if (result && result.length > 0) {
      logger.warn(
        {
          familyId: tokenFamilyId,
          userId: result[0]?.userId,
        },
        'Token family revoked'
      );
    }
  }
}
