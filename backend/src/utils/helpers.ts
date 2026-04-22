import crypto from 'crypto';
import { cryptoHash } from './hash.util';

export const workspaceSlugGen = (str: string) => {
  const slug = str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const hash = crypto.randomBytes(2).toString('hex');
  return `${slug}-${hash}`;
};

export const generateSecureOtp = () => {
  const otp = crypto.randomInt(100000, 1000000).toString();

  const hashedOtp = cryptoHash(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return { otp, hashedOtp, expiresAt };
};

export const getResourceType = (mimeType: string): 'image' | 'raw' => {
  if (mimeType.startsWith('image/')) return 'image';
  return 'raw';
};
