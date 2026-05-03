import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

import { NotificationController } from '../controllers/notification.controller';
import { validateUrlParams } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/async-handler';
import { paramsSchema } from '../validations/urlParams.validation';

const router = Router();

router.get(
  '/',
  authenticate,
  asyncHandler(NotificationController.getNotifications)
);

router.patch(
  '/:NotificationId/read',
  authenticate,
  validateUrlParams(paramsSchema),
  asyncHandler(NotificationController.markRead)
);

router.patch(
  '/read-all',
  authenticate,
  asyncHandler(NotificationController.markAllRead)
);

export default router;
