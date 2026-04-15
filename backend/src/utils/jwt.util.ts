import jwt, { type SignOptions } from 'jsonwebtoken';
import type { User } from '../types/auth.types';
import { env } from '../config/env';

export const jwtToken = (payload: User) => {
  const tokenSecret = env.ACCESS_TOKEN_SECRET;
  const tokenExpiry = env.ACCESS_TOKEN_EXPIRY;

  const options: SignOptions = {
    expiresIn: tokenExpiry as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, tokenSecret, options);
};

export const jwtVerify = (token: string) => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as User;
};
