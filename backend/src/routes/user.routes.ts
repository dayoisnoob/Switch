import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { UserController } from '../controllers/user.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router({ mergeParams: true });

router.get('/me', authenticate, asyncHandler(UserController.getMe));

router.get(
  '/me/teammates/count',
  authenticate,
  asyncHandler(UserController.getAllTeamMembersCount)
);

router.get(
  '/me/projects/count',
  authenticate,
  asyncHandler(UserController.getUserActiveProjectsCount)
);

export default router;
