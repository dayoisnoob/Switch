import z from 'zod';

export const paramsSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID').optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
  boardId: z.string().uuid('Invalid board ID').optional(),
  columnId: z.string().uuid('Invalid column ID').optional(),
  cardId: z.string().uuid('Invalid card ID').optional(),
  labelId: z.string().uuid('Invalid label ID').optional(),
  userId: z.string().uuid('Invalid user ID').optional(),
  commentId: z.string().uuid('Invalid comment ID').optional(),
  memberId: z.string().uuid('Invalid member ID').optional(),
});
