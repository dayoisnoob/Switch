import { z } from 'zod';
import { capitalize } from '../utils/helpers';

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Workspace needs to have a name')
    .max(100)
    .trim()
    .transform(capitalize),
  slug: z.string().trim().toLowerCase(),
  colour: z.string(),
});

export const sendInvitationSchema = z.object({
  email: z.string().email('Please enter a valid email').trim().toLowerCase(),
  role: z.enum(['Admin', 'Member']),
});

export const resendInvitationSchema = z.object({
  email: z.string().email('Please enter a valid email').trim().toLowerCase(),
});

export type CreateWP = z.infer<typeof createWorkspaceSchema>;
export type SendInvite = z.infer<typeof sendInvitationSchema>;
