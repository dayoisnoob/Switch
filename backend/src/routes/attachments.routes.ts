// routes/attachments.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireWorkspaceMember } from '../middleware/workspace.middleware';
import { upload, multerErrorHandler } from '../middleware/upload.middleware';
import { AttachmentsController } from '../controllers/attachments.controller';
import { asyncHandler } from '../utils/async-handler';
import { validateUrlParams } from '../middleware/validation.middleware';
import { paramsSchema } from '../validations/urlParams.validation';

const router = Router({ mergeParams: true });

router.post(
  '/',
  authenticate,
  upload.single('file'),
  multerErrorHandler,
  requireWorkspaceMember,
  asyncHandler(AttachmentsController.uploadAttachment)
);

router.delete(
  '/:attachmentId',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(AttachmentsController.deleteAttachment)
);

export default router;
