import type { CookieOptions } from 'express';
import { env } from './config/env';

export const isProd = env.NODE_ENV === 'production';

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  domain: isProd ? '.switchapp.space' : undefined,
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const RESEND_COOLDOWN_SECONDS = 60;

export const FIVE_MIN_CACHE = 300;
export const TEN_MIN_CACHE = 600;
export const ONE_HOUR_CACHE = 3600;
