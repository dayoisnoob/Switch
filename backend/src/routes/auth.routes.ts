import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

import { env } from '../config/env';
import passport from '../config/passport';
import {
  refreshTokenLimiter,
  registerIpLimiter,
} from '../middleware/rate-limit.middleware';
import { validateInput } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/async-handler';
import {
  deleteAccountSchema,
  updateUserSchema,
} from '../validations/auth.validation';

const router = Router();

router.get(
  '/google',
  registerIpLimiter,
  passport.authenticate('google', {
    session: false,
  })
);

router.get(
  '/google/callback',
  registerIpLimiter,
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.FRONTEND_URL}/login?error=google_failed`,
  }),
  asyncHandler(AuthController.oAuthCallback),
  AuthController.oAuthError
);

router.get(
  '/github',
  registerIpLimiter,
  passport.authenticate('github', {
    session: false,
  })
);

router.get(
  '/github/callback',
  registerIpLimiter,
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${env.FRONTEND_URL}/login?error=github_failed`,
  }),
  asyncHandler(AuthController.oAuthCallback),
  AuthController.oAuthError
);

router.post(
  '/refresh-token',
  refreshTokenLimiter,
  asyncHandler(AuthController.refreshAccessToken)
);

router.use(authenticate);

router.post('/logout', asyncHandler(AuthController.logout));
router.post('/logout-all', asyncHandler(AuthController.logoutAll));

router.patch(
  '/profile',
  validateInput(updateUserSchema),
  asyncHandler(AuthController.updateUser)
);

router.delete(
  '/delete',
  validateInput(deleteAccountSchema),
  asyncHandler(AuthController.deleteUser)
);

export default router;
