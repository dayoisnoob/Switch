import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project needs to have a name').max(50).trim(),
  description: z.string().trim().optional(),
});

export type ProjectDetailType = z.infer<typeof createProjectSchema>;
