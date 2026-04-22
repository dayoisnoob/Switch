import 'dotenv/config';
import { z } from 'zod';
import { logger } from './logger';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  DATABASE_URL: z.string(),
  DATABASE_URL_TEST: z.string().optional(),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  PORT: z.string().default('8000'),

  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DB: z.string().optional(),

  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  RESET_TOKEN_SECRET: z.string(),
  RESET_TOKEN_EXPIRY: z.string().default('10m'),

  EMAIL_FROM: z.string(),

  FRONTEND_URL: z.string().default('http://localhost:7001'),

  RESEND_API_KEY: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  CLOUDINARY_URL: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),

  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_CALLBACK_URL: z.string(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  logger.error(
    { errors: result.error.format() },
    'Invalid environment variables'
  );
  process.exit(1);
}

export const env = result.data;
