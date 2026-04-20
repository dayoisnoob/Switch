import { Router } from 'express';

import { InvitationsController } from '../controllers/invitations.controller';
import { asyncHandler } from '../utils/async-handler';

const router = Router();

router.post(
  '/:token/accept',
  asyncHandler(InvitationsController.acceptInvitation)
);

export default router;
