import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { JwtPayload } from '../types/auth.types';

export const jwtToken = (
  payload: JwtPayload,
  secret: string = env.ACCESS_TOKEN_SECRET,
  expiry: string = env.ACCESS_TOKEN_EXPIRY
) => {
  const options: SignOptions = {
    expiresIn: expiry as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, options);
};

export const jwtVerify = (
  token: string,
  secret: string = env.ACCESS_TOKEN_SECRET
) => {
  return jwt.verify(token, secret) as JwtPayload;
};
