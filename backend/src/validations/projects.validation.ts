import { z } from 'zod';
import { capitalize } from '../utils/helpers';

export const projectInputSchema = z.object({
  name: z
    .string()
    .min(1, 'Project needs to have a name')
    .max(50)
    .trim()
    .transform(capitalize),
  description: z.string().trim().optional(),
});

export const createColumnSchema = z.object({
  name: z
    .string()
    .min(1, 'Column needs to have a name')
    .max(100)
    .trim()
    .transform(capitalize),
});

export const columnOrderSchema = z.object({
  order: z.number(),
});
