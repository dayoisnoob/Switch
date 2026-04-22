import z from 'zod';

export const paramsSchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  workspaceId: z.string().uuid('Invalid workspace ID').optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
  boardId: z.string().uuid('Invalid board ID').optional(),
  columnId: z.string().uuid('Invalid column ID').optional(),
  cardId: z.string().uuid('Invalid card ID').optional(),
  labelId: z.string().uuid('Invalid label ID').optional(),
  commentId: z.string().uuid('Invalid comment ID').optional(),
  attachmentId: z.string().uuid('Invalid attachment ID').optional(),
  notificationId: z.string().uuid('Invalid notification ID').optional(),
});
