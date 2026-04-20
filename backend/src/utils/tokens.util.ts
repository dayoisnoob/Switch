import crypto from 'crypto';
import { db } from '../config/db';
import { refreshTokensTable, type UserType } from '../db';
import type { JwtPayload, TokenGenType } from '../types/auth.types';
import { cryptoHash, randomBytes } from './hash.util';
import { jwtToken } from './jwt.util';

type DbOrTx = Parameters<Parameters<typeof db.transaction>[0]>[0] | typeof db;

export const tempTokens = () => {
  const token = crypto.randomBytes(16).toString('hex');
  const tokenHash = cryptoHash(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return { token, tokenHash, expiresAt };
};

export const authTokens = async (
  userData: UserType,
  storedFamilyId?: string,
  tx: DbOrTx = db
) => {
  const jwtPayload: JwtPayload = {
    id: userData.id,
    firstName: userData.firstName as string,
    isActive: userData.isActive,
    role: userData.role,
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
};
