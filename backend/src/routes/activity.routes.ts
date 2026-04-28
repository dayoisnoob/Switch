import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

import { ActivityController } from '../controllers/activity.controller';
import { requireWorkspaceMember } from '../middleware/workspace.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router({ mergeParams: true });

router.get(
  '/',
  authenticate,
  requireWorkspaceMember,
  asyncHandler(ActivityController.getLogs)
);

export default router;
