import { z } from 'zod';
import { capitalize } from '../utils/helpers';

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project needs to have a name')
    .max(50)
    .trim()
    .transform(capitalize),
  description: z.string().trim().optional(),
  icon: z.string(),
  workspaceId: z.string().uuid(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const createColumnSchema = z.object({
  name: z
    .string()
    .min(1, 'Column needs to have a name')
    .max(100)
    .trim()
    .transform(capitalize),
  mappedStatus: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELED']),
});

export const updateColumnSchema = z.object({
  name: z
    .string()
    .min(1, 'Column needs to have a name')
    .max(100)
    .trim()
    .transform(capitalize)
    .optional(),
  mappedStatus: z
    .enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELED'])
    .optional(),
});

export const columnOrderSchema = z.object({
  order: z.number(),
});

export const moveCardsSchema = z.object({
  targetColumnId: z.string().uuid(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateColumn = z.infer<typeof createColumnSchema>;
