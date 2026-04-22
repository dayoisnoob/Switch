import { z } from 'zod';

export const createLabelSchema = z.object({
  name: z.string().min(1, 'label needs to have a title').max(50).trim(),
  color: z.string().trim(),
});

export const updateLabelSchema = z.object({
  name: z.string().max(50).trim().optional(),
  color: z.string().trim().optional(),
});

export type CreateLabelType = z.infer<typeof createLabelSchema>;
export type UpdateLabelType = z.infer<typeof updateLabelSchema>;
