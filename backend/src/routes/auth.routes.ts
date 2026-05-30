import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

import { env } from '../config/env';
import passport from '../config/passport';
import { isProd } from '../constants';
import {
  changePasswordLimiter,
  forgotPasswordHourlyLimiter,
  forgotPasswordRecentLimiter,
  loginEmailLimiter,
  loginIpLimiter,
  refreshTokenLimiter,
  registerIpLimiter,
  resendVerificationLimiter,
  resetPasswordLimiter,
} from '../middleware/rate-limit.middleware';
import { validateInput } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/async-handler';
import {
  changePasswordSchema,
  completeRegSchema,
  deleteAccountSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  sendOtpSchema,
  updateUserSchema,
  verifyOtpSchema,
} from '../validations/auth.validation';

const router = Router();

// OAuth
router.get('/google', (req, res, next) => {
  const state = req.query.state as string | undefined;

  if (state) {
    res.cookie('oauth_invite_state', state, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 10 * 60 * 1000,
    });
  }

  passport.authenticate('google', { session: false })(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.FRONTEND_URL}/login?error=google_failed`,
  }),
  asyncHandler(AuthController.OAuthCallback),
  AuthController.OAuthError
);

router.get('/github', (req, res, next) => {
  const state = req.query.state as string | undefined;

  if (state) {
    res.cookie('oauth_invite_state', state, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 10 * 60 * 1000,
    });
  }

  passport.authenticate('github', { session: false })(req, res, next);
});

router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${env.FRONTEND_URL}/login?error=github_failed`,
  }),
  asyncHandler(AuthController.OAuthCallback),
  AuthController.OAuthError
);

// Registration

router.post(
  '/register/initialise',
  registerIpLimiter,
  validateInput(sendOtpSchema),
  asyncHandler(AuthController.init)
);

router.post(
  '/register/verify-otp',
  registerIpLimiter,
  validateInput(verifyOtpSchema),
  asyncHandler(AuthController.verifyOtpForLogin)
);

router.post(
  '/register/resend-otp',
  resendVerificationLimiter,
  validateInput(sendOtpSchema),
  asyncHandler(AuthController.init)
);

router.patch(
  '/register/onboarding',
  registerIpLimiter,
  validateInput(completeRegSchema),
  asyncHandler(AuthController.completeReg)
);

// Login

router.post(
  '/login',
  loginIpLimiter,
  loginEmailLimiter,
  validateInput(loginSchema),
  asyncHandler(AuthController.login)
);

// Token

router.post(
  '/refresh',
  refreshTokenLimiter,
  asyncHandler(AuthController.refreshAccessToken)
);

// Password Reset

router.post(
  '/forgot-password',
  forgotPasswordRecentLimiter,
  forgotPasswordHourlyLimiter,
  validateInput(forgotPasswordSchema),
  asyncHandler(AuthController.forgotPassword)
);

router.post(
  '/forgot-password/verify-otp',
  registerIpLimiter,
  validateInput(verifyOtpSchema),
  asyncHandler(AuthController.verifyOtpForResetPassword)
);

router.post(
  '/reset-password',
  resetPasswordLimiter,
  validateInput(resetPasswordSchema),
  asyncHandler(AuthController.resetPassword)
);

router.post('/logout', asyncHandler(AuthController.logout));
router.post('/logout-all', asyncHandler(AuthController.logoutAll));

// Authenticated Routes

router.patch(
  '/profile',
  authenticate,
  validateInput(updateUserSchema),
  asyncHandler(AuthController.updateUser)
);

router.patch(
  '/change-password',
  authenticate,
  changePasswordLimiter,
  validateInput(changePasswordSchema),
  asyncHandler(AuthController.changePassword)
);

router.delete(
  '/delete',
  authenticate,
  validateInput(deleteAccountSchema),
  asyncHandler(AuthController.deleteUser)
);

export default router;
