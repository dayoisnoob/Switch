import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'task needs to have a name').max(50).trim(),
  description: z.string().trim().optional(),
  columnId: z.string().uuid(),
  assignees: z.array(z.string()).optional(),
});

export const updateTaskPositionSchema = z.object({
  columnId: z.string().uuid(),
  order: z.number(),
});

export type TaskDetailsType = z.infer<typeof createTaskSchema>;
