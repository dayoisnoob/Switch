import z from 'zod';

export const createCommentSchema = z.object({
  content: z.string().max(255).trim(),
});

export type CreateCommentType = z.infer<typeof createCommentSchema>;
