import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { COOKIE_OPTIONS } from '../constants';
import { AuthService } from '../services/auth.service';
import { ApiError, ApiResponse } from '../utils/api-response';
import type { OAuthProfileInput } from '../types/auth.types';
import type { AuthenticatedRequest } from '../types/express';

export class AuthController {
  static async OAuthCallback(req: Request, res: Response) {
    const userProfile = req.user as OAuthProfileInput;

    if (!userProfile) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const { accessToken, refreshToken } = await AuthService.OAuthSignIn(
      userProfile as OAuthProfileInput
    );

    const redirectUrl = userProfile.inviteToken
      ? `${env.FRONTEND_URL}/invite/accept?token=${userProfile.inviteToken}`
      : `${env.FRONTEND_URL}/getting-you-started`;

    return res
      .cookie('__auth.refresh', refreshToken, COOKIE_OPTIONS)
      .cookie('__auth.access', accessToken, {
        ...COOKIE_OPTIONS,
        httpOnly: false,
      })
      .redirect(redirectUrl);
  }

  static OAuthError(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    const message = encodeURIComponent(err.message || 'Authentication failed');
    return res.redirect(`${env.FRONTEND_URL}/login?error=${message}`);
  }

  static async init(req: Request, res: Response) {
    const userEmail = await AuthService.init(req.body.email);

    res.json(
      new ApiResponse(
        200,
        'Verification code sent. Please check your email.',
        userEmail
      )
    );
  }

  static async verifyOtpForLogin(req: Request, res: Response) {
    await AuthService.verifyOtpForLogin(req.body);

    res.json(new ApiResponse(200, 'Email verified successfully'));
  }

  static async verifyOtpForResetPassword(req: Request, res: Response) {
    const token = await AuthService.verifyOtpForResetPassword(req.body);

    res.json(
      new ApiResponse(200, 'OTP verified successfully', { token: token })
    );
  }

  static async completeReg(req: Request, res: Response) {
    const { user, tokens } = await AuthService.completeReg(req.body);

    return res
      .cookie('__auth.refresh', tokens.refreshToken, COOKIE_OPTIONS)
      .cookie('__auth.access', tokens.accessToken, {
        ...COOKIE_OPTIONS,
        httpOnly: false,
      })
      .status(201)
      .json(new ApiResponse(201, 'Account created successfully', user));
  }

  static async login(req: Request, res: Response) {
    const { user, tokens } = await AuthService.login(req.body);

    res
      .cookie('__auth.refresh', tokens.refreshToken, COOKIE_OPTIONS)
      .cookie('__auth.access', tokens.accessToken, {
        ...COOKIE_OPTIONS,
        httpOnly: false,
      })
      .json(new ApiResponse(200, 'Login successful', user));
  }

  static async refreshAccessToken(req: Request, res: Response) {
    const refreshToken = req.cookies['__auth.refresh'];

    if (!refreshToken.trim())
      throw new ApiError(401, 'Authentication required. Please sign in.');

    const result = await AuthService.refreshAccessToken(refreshToken);

    res
      .cookie('__auth.refresh', result.refreshToken, COOKIE_OPTIONS)
      .cookie('__auth.access', result.accessToken, {
        ...COOKIE_OPTIONS,
        httpOnly: false,
      })
      .json(new ApiResponse(200, 'Access token successfully refreshed'));
  }

  static async logout(req: AuthenticatedRequest, res: Response) {
    const refreshToken = req.cookies['__auth.refresh'];

    if (!refreshToken)
      throw new ApiError(401, 'Authentication required. Please sign in.');

    const result = await AuthService.logout(refreshToken);

    res
      .clearCookie('__auth.refresh', COOKIE_OPTIONS)
      .clearCookie('__auth.access', {
        ...COOKIE_OPTIONS,
        httpOnly: true,
      })
      .json(new ApiResponse(200, result.message));
  }

  static async logoutAll(req: AuthenticatedRequest, res: Response) {
    const result = await AuthService.logoutAll(req.user.id);

    res
      .clearCookie('__auth.refresh', COOKIE_OPTIONS)
      .clearCookie('__auth.access', {
        ...COOKIE_OPTIONS,
        httpOnly: true,
      })
      .json(new ApiResponse(200, result.message));
  }

  static async forgotPassword(req: Request, res: Response) {
    await AuthService.forgotPassword(req.body.email);

    res.json(new ApiResponse(200, "If email exists, we'll send an OTP"));
  }

  static async resetPassword(req: Request, res: Response) {
    await AuthService.resetPassword(req.body);

    res.json(new ApiResponse(200, 'Password was successfully reset.'));
  }

  static async changePassword(req: AuthenticatedRequest, res: Response) {
    await AuthService.changePassword(req.user.id, req.body);

    res.json(new ApiResponse(200, 'Password was successfully reset.'));
  }

  static async updateUser(req: AuthenticatedRequest, res: Response) {
    const updatedUser = await AuthService.updateUser(req.user.id, req.body);
    res.json(
      new ApiResponse(200, 'User successfully updated', { user: updatedUser })
    );
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response) {
    await AuthService.deleteUser(req.user.id, req.body.password);

    res.clearCookie('__auth.refresh', COOKIE_OPTIONS);
    res.clearCookie('__auth.access', { ...COOKIE_OPTIONS, httpOnly: false });
    res.json(
      new ApiResponse(200, 'Your account has been deleted successfully.')
    );
  }
}
