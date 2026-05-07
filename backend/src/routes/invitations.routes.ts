import { Router } from 'express';

import { InvitationsController } from '../controllers/invitations.controller';
import { optionalAuthenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.get(
  '/verify/:token',
  asyncHandler(InvitationsController.verifyInvitation)
);

router.post(
  '/accept/:token',
  optionalAuthenticate,
  asyncHandler(InvitationsController.acceptInvitation)
);

export default router;
