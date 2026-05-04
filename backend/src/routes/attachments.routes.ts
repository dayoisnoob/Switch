import { Router } from 'express';
import { AttachmentsController } from '../controllers/attachments.controller';
import { authenticate } from '../middleware/auth.middleware';
import { multerErrorHandler, upload } from '../middleware/upload.middleware';
import { validateUrlParams } from '../middleware/validation.middleware';
import { requireWorkspaceMember } from '../middleware/workspace.middleware';
import { asyncHandler } from '../utils/async-handler';
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
