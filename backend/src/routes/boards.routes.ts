import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

import { BoardController } from '../controllers/board.controller';
import { requireWorkspaceMember } from '../middleware/workspace.middleware';
import { asyncHandler } from '../utils/async-handler';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get(
  '/',
  requireWorkspaceMember,
  cacheMiddleware(300),
  asyncHandler(BoardController.getBoardState)
);

export default router;
