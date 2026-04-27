import { z } from 'zod';

export const createLabelSchema = z.object({
  name: z.string().min(1, 'label needs to have a title').max(50).trim(),
  colour: z.string().trim(),
});

export const updateLabelSchema = z.object({
  name: z.string().max(50).trim().optional(),
  colour: z.string().trim().optional(),
});

export type CreateLabelType = z.infer<typeof createLabelSchema>;
export type UpdateLabelType = z.infer<typeof updateLabelSchema>;
