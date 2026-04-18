import { and, eq, gt, gte, or, sql } from 'drizzle-orm';
import { db } from '../config/db';

import { ApiError } from '../utils/api-response';
import { bcryptCompare, bcryptHash, cryptoHash } from '../utils/hash.util';

import { env } from '../config/env';
import { logger } from '../config/logger';
import { otpTable, refreshTokensTable, usersTable } from '../db';
import { queueEmail } from '../queues/email.queue';
import type { OAuthProfileInput } from '../types/auth.types';
import { Tokens } from '../utils/tokens.util';
import type {
  changePasswordInput,
  LoginInput,
  resetPasswordInput,
  SignupInput,
  updateInput,
} from '../validations/auth.validation';
import { generateSecureOtp } from '../utils/helpers';
import { jwtToken, jwtVerify } from '../utils/jwt.util';

export class AuthService {
  static async OAuthSignIn(userProfile: OAuthProfileInput) {
    const existingUser = await AuthService.findUserByIdentifier(
      userProfile.email
    );

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

      const tokens = await Tokens.generateAuthTokens(userToLogin);

      return { user: userToLogin, ...tokens };
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

    try {
      await queueEmail({
        user: { firstName: newUser.firstName!, email: newUser.email },
        link: env.FRONTEND_URL,
        type: 'welcome',
      });
    } catch (err) {
      logger.error(
        { userId: newUser.id, err },
        'Failed to queue welcome email'
      );
    }

    const tokens = await Tokens.generateAuthTokens(newUser);
    return { user: newUser, ...tokens };
  }

  static async init(email: string) {
    const existing = await AuthService.findUserByIdentifier(email);

    if (existing && existing.emailVerified) {
      throw new ApiError(
        409,
        'An account with this email already exists. Please sign in.'
      );
    }

    if (existing && !existing.emailVerified) {
      await AuthService.sendOtp(
        existing.id,
        existing.email,
        'email_verification'
      );
      return { email: existing.email };
    }

    const [newUser] = await db
      .insert(usersTable)
      .values({
        email,
        emailVerified: false,
      })
      .returning();

    if (!newUser) {
      throw new ApiError(500, 'Could not register new user. Please try again');
    }

    await AuthService.sendOtp(newUser.id, newUser.email, 'email_verification');

    return { email: newUser.email };
  }

  static async verifyOtpForLogin(data: { email: string; code: string }) {
    const { email, code } = data;
    const existing = await AuthService.findUserByIdentifier(email);

    if (!existing) {
      throw new ApiError(404, 'User does not exist');
    }

    const { otpId } = await AuthService.verifyOtp(
      existing.id,
      code,
      'email_verification'
    );

    await db.transaction(async (tx) => {
      await tx
        .update(otpTable)
        .set({
          isInvalidated: true,
        })
        .where(eq(otpTable.id, otpId))
        .returning();

      await tx
        .update(usersTable)
        .set({
          emailVerified: true,
        })
        .where(eq(usersTable.email, email))
        .returning();
    });
  }

  static async verifyOtpForResetPassword(data: {
    email: string;
    code: string;
  }) {
    const { email, code } = data;
    const existing = await AuthService.findUserByIdentifier(email);

    if (!existing) {
      throw new ApiError(404, 'User does not exist');
    }

    const { otpId } = await AuthService.verifyOtp(
      existing.id,
      code,
      'password_reset'
    );

    await db
      .update(otpTable)
      .set({
        isInvalidated: true,
      })
      .where(eq(otpTable.id, otpId))
      .returning();

    const payload = {
      id: existing.id,
      purpose: 'password_reset',
    };

    return jwtToken(payload, env.RESET_TOKEN_SECRET, env.RESET_TOKEN_EXPIRY);
  }

  static async completeReg(userData: SignupInput) {
    const { firstName, lastName, email, password } = userData;
    const existing = await AuthService.findUserByIdentifier(email);

    if (!existing?.emailVerified) {
      throw new ApiError(403, 'Please verify your email');
    }

    if (existing.passwordHash) {
      throw new ApiError(
        409,
        'Registration already completed. Please sign in.'
      );
    }

    const passwordHash = await bcryptHash(password);

    const [updatedUser] = await db
      .update(usersTable)
      .set({
        firstName,
        lastName,
        passwordHash,
      })
      .where(eq(usersTable.email, email))
      .returning();

    if (!updatedUser)
      throw new ApiError(500, 'Registration failed. Please try again.');

    try {
      await queueEmail({
        user: { firstName, email },
        link: env.FRONTEND_URL,
        type: 'welcome',
      });
    } catch (err) {
      logger.error(
        { userId: existing.id, err },
        'Failed to queue welcome email'
      );
    }

    const tokens = await Tokens.generateAuthTokens(updatedUser);
    return tokens;
  }

  static async login(credentials: LoginInput) {
    const { email, password } = credentials;

    const existing = await AuthService.findUserByIdentifier(email);

    if (!existing) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!existing.emailVerified) {
      throw new ApiError(
        403,
        'Please verify your email address before signing in'
      );
    }
    if (!existing.isActive) {
      throw new ApiError(
        403,
        'Your account has been suspended. Please contact support for assistance.'
      );
    }

    if (!existing.passwordHash) {
      throw new ApiError(
        403,
        'This account uses OAuth. Please sign in with Google or GitHub.'
      );
    }

    const isPasswordValid = await bcryptCompare(
      password,
      existing.passwordHash as string
    );
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    await db
      .update(usersTable)
      .set({ lastLogin: new Date() })
      .where(eq(usersTable.id, existing.id));

    const tokens = await Tokens.generateAuthTokens(existing);

    logger.info({ userId: existing.id, email }, 'User logged in');

    return { email, ...tokens };
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

  static async forgotPassword(email: string) {
    const existing = await AuthService.findUserByIdentifier(email);

    if (!existing) {
      logger.info({ email }, 'Password reset requested for unregistered email');
      return;
    }

    if (!existing.emailVerified) {
      logger.info({ email }, 'Password reset requested for unverified account');
      return;
    }

    if (!existing.passwordHash) {
      logger.info({ email }, 'Password reset requested for OAuth account');
      return;
    }

    await AuthService.sendOtp(
      existing.id,
      email,
      'password_reset',
      existing.firstName as string
    );

    return;
  }

  static async resetPassword(data: resetPasswordInput) {
    const { token, newPassword } = data;
    if (!token) {
      throw new ApiError(
        403,
        'This password reset link is invalid. Please request a new one.'
      );
    }

    const decoded = jwtVerify(token, env.RESET_TOKEN_SECRET);

    if (decoded.purpose !== 'password_reset') {
      throw new ApiError(403, 'Invalid reset token.');
    }

    const userId = decoded.id;

    const [user] = await db
      .select({
        id: usersTable.id,
        passwordHash: usersTable.passwordHash,
      })
      .from(usersTable)
      .where(and(eq(usersTable.id, userId), eq(usersTable.isActive, true)))
      .limit(1);

    if (!user) {
      throw new ApiError(
        403,
        'This password reset link is no longer valid. Please request a new one.'
      );
    }

    if (!user.passwordHash) {
      throw new ApiError(
        403,
        'This account uses OAuth. Password reset is not available.'
      );
    }

    const isSamePassword = await bcryptCompare(newPassword, user.passwordHash);

    if (isSamePassword) {
      throw new ApiError(
        422,
        'Your new password cannot be the same as your old password.'
      );
    }

    const hashedPassword = await bcryptHash(newPassword);

    await db.transaction(async (tx) => {
      await tx
        .update(usersTable)
        .set({
          passwordHash: hashedPassword,
        })
        .where(eq(usersTable.id, user.id));

      await tx
        .delete(refreshTokensTable)
        .where(eq(refreshTokensTable.userId, user.id));
    });

    // await queueEmail({
    //   user: { firstName: user.firstName, email: user.email },
    //   link: '',
    //   type: 'changePassword',
    // });

    logger.info(
      { userId: user.id, timestamp: new Date() },
      'Password reset audit:'
    );
  }

  static async changePassword(userId: string, data: changePasswordInput) {
    const { currentPassword, newPassword } = data;

    const existing = await AuthService.findUserByIdentifier(userId, 'id');

    if (!existing) {
      throw new ApiError(401, 'User not found');
    }

    if (!existing.passwordHash) {
      logger.info(
        { email: existing.email },
        'Password reset requested for OAuth account'
      );
      return;
    }

    const iscurrentPasswordCorrect = await bcryptCompare(
      currentPassword,
      existing.passwordHash
    );

    if (!iscurrentPasswordCorrect) {
      throw new ApiError(401, 'Your current password is incorrect');
    }

    const newPasswordHash = await bcryptHash(newPassword);

    await db.transaction(async (tx) => {
      await tx
        .update(usersTable)
        .set({
          passwordHash: newPasswordHash,
        })
        .where(eq(usersTable.id, userId));

      await tx
        .delete(refreshTokensTable)
        .where(eq(refreshTokensTable.userId, userId));
    });

    // await queueEmail({
    //   user: { firstName: user.firstName, email: user.email },
    //   link: '',
    //   type: 'changePassword',
    // });

    logger.info(
      {
        id: userId,
        timestamp: new Date(),
      },
      'Password change audit:'
    );
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
      user: { firstName: existing.firstName!, email: existing.email },
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

  private static async sendOtp(
    userId: string,
    email: string,
    purpose: 'email_verification' | 'password_reset',
    firstName?: string
  ) {
    await db
      .update(otpTable)
      .set({ isInvalidated: true })
      .where(
        and(
          eq(otpTable.userId, userId),
          eq(otpTable.purpose, purpose),
          eq(otpTable.isInvalidated, false)
        )
      );

    const { otp, hashedOtp, expiresAt } = generateSecureOtp();

    await db
      .insert(otpTable)
      .values({
        userId,
        hashedCode: hashedOtp,
        purpose,
        expiresAt,
      })
      .returning();

    try {
      await queueEmail({
        user: { email, firstName },
        code: otp,
        type: 'otp',
      });
    } catch (err) {
      logger.error({ userId, err }, 'Failed to queue OTP email');
    }
  }

  private static async findUserByIdentifier(
    identifier: string,
    field: 'id' | 'email' = 'email'
  ) {
    const column = { email: usersTable.email, id: usersTable.id };
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        avatarUrl: usersTable.avatarUrl,
        emailVerified: usersTable.emailVerified,
        isActive: usersTable.isActive,
        passwordHash: usersTable.passwordHash,
        role: usersTable.role,
      })
      .from(usersTable)
      .where(eq(column[field], identifier))
      .limit(1);

    return user;
  }

  private static async verifyOtp(
    userId: string,
    code: string,
    purpose: 'email_verification' | 'password_reset'
  ) {
    const [otp] = await db
      .select({
        id: otpTable.id,
        attempts: otpTable.attempts,
        hashed: otpTable.hashedCode,
      })
      .from(otpTable)
      .where(
        and(
          eq(otpTable.userId, userId),
          eq(otpTable.purpose, purpose),
          eq(otpTable.isInvalidated, false),
          gt(otpTable.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!otp) {
      throw new ApiError(
        403,
        'Code is invalid or has expired. Please request a new one.'
      );
    }

    if (otp.attempts >= 3) {
      throw new ApiError(
        429,
        'Too many incorrect attempts. Please request a new code.'
      );
    }

    const hashedCode = cryptoHash(code);

    if (hashedCode !== otp.hashed) {
      await db
        .update(otpTable)
        .set({ attempts: sql`${otpTable.attempts} + 1` })
        .where(eq(otpTable.id, otp.id))
        .returning();

      throw new ApiError(
        401,
        `Incorrect code. ${3 - otp.attempts - 1} attempt(s) remaining.`
      );
    }

    return { hashedCode, otpId: otp.id };
  }
}
