import { z } from 'zod';

export const createCardSchema = z.object({
  title: z.string().min(2, 'card needs to have a title').max(50).trim(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELED']),
  description: z.string().trim().optional(),
  assignees: z.array(z.string()).optional(),
});

export const updateCardSchema = z.object({
  title: z.string().max(50).trim().optional(),
  description: z.string().trim().optional(),
  priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.coerce.date().optional(),
});

export const moveCardSchema = z.object({
  columnId: z.string().uuid('Invalid column ID'),
  order: z.number(),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELED']),
});

export const assignUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export const attachLabelSchema = z.object({
  labelId: z.string().uuid('Invalid label ID'),
});

export type CardDataType = z.infer<typeof createCardSchema>;
export type UpdateCardType = z.infer<typeof updateCardSchema>;
export type MoveCardType = z.infer<typeof moveCardSchema>;
