import { z } from 'zod';

export const updateUserSchema = z.object({
  firstName: z.string().min(1).trim().optional(),
  lastName: z.string().min(1).trim().optional(),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'password is required'),
});

export type updateInput = z.infer<typeof updateUserSchema>;
