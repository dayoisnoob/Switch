import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

import { CommentController } from '../controllers/comment.controller';
import {
  validateInput,
  validateUrlParams,
} from '../middleware/validation.middleware';
import { requireWorkspaceMember } from '../middleware/workspace.middleware';
import { asyncHandler } from '../utils/async-handler';
import { createCommentSchema } from '../validations/comment.validation';
import { paramsSchema } from '../validations/urlParams.validation';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/',
  validateUrlParams(paramsSchema),
  validateInput(createCommentSchema),
  requireWorkspaceMember,
  asyncHandler(CommentController.createComment)
);

router.patch(
  '/:commentId',
  validateUrlParams(paramsSchema),
  validateInput(createCommentSchema),
  requireWorkspaceMember,
  asyncHandler(CommentController.editComment)
);

router.delete(
  '/:commentId',
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(CommentController.deleteComment)
);

export default router;
