import crypto from 'crypto';
import { db } from '../config/db';
import { refreshTokensTable } from '../db';
import type { User } from '../types/auth.types';
import { cryptoHash, randomBytes } from './hash.util';
import { jwtToken } from './jwt.util';

type DbOrTx = Parameters<Parameters<typeof db.transaction>[0]>[0] | typeof db;

export class Tokens {
  static async generateAuthTokens(
    userData: User,
    storedFamilyId?: string,
    tx: DbOrTx = db
  ) {
    const jwtPayload: User = {
      id: userData.id,
      email: userData.email,
      isActive: userData.isActive,
      role: userData.role,
      firstName: userData.firstName,
      lastName: userData.lastName,
    };

    const accessToken = jwtToken(jwtPayload);
    const refreshToken = randomBytes();
    const hashedRefreshToken = cryptoHash(refreshToken);
    const tokenFamilyId = storedFamilyId ?? crypto.randomUUID();

    await tx.insert(refreshTokensTable).values({
      userId: userData.id,
      tokenHash: hashedRefreshToken,
      tokenFamilyId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lastUsedAt: new Date(),
    });

    return { accessToken, refreshToken };
  }
}
