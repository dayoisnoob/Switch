import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

import { CommentController } from '../controllers/comments.controller';
import {
  validateInput,
  validateUrlParams,
} from '../middleware/validation.middleware';
import { requireWorkspaceMember } from '../middleware/workspace.middleware';
import { asyncHandler } from '../utils/async-handler';
import { createCommentSchema } from '../validations/comments.validation';
import { paramsSchema } from '../validations/urlParams.validation';

const router = Router({ mergeParams: true });

router.post(
  '/',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(createCommentSchema),
  requireWorkspaceMember,
  asyncHandler(CommentController.createComment)
);

router.patch(
  '/:commentId',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(createCommentSchema),
  requireWorkspaceMember,
  asyncHandler(CommentController.editComment)
);

router.delete(
  '/:commentId',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(CommentController.deleteComment)
);

export default router;
