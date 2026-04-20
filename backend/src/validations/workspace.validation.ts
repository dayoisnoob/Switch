import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace needs to have a name').max(100).trim(),
});

export const sendInvitationSchema = z.object({
  email: z.string().email('Please enter a valid email').trim().toLowerCase(),
});
