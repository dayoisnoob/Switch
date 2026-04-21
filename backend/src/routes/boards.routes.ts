import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

import { BoardController } from '../controllers/board.controller';
import { requireWorkspaceMember } from '../middleware/workspace.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requireWorkspaceMember,
  asyncHandler(BoardController.getBoardState)
);

export default router;
