import crypto from 'crypto';
import { cryptoHash } from './hash.util';
import type { AuthenticatedUser } from '../types/express';

export const slugGen = (str: string) => {
  const slug = str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug;
};

export const generateSecureOtp = () => {
  const otp = crypto.randomInt(100000, 1000000).toString();

  const hashedOtp = cryptoHash(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return { otp, hashedOtp, expiresAt };
};

export const getResourceType = (mimetype: string) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'raw';
};

export const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

export const getActorName = (user: AuthenticatedUser) =>
  `${user.firstName} ${user.lastName}`.trim();
