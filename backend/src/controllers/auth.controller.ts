import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { COOKIE_OPTIONS } from '../constants';
import { AuthService } from '../services/auth.service';
import { ApiError, ApiResponse } from '../utils/api-response';
import { Tokens } from '../utils/tokens.util';

export class AuthController {
  static async oAuthCallback(req: Request, res: Response) {
    const user = req.user;

    if (!user) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    const { accessToken, refreshToken } = await Tokens.generateAuthTokens(user);

    res
      .cookie('__auth.refresh', refreshToken, COOKIE_OPTIONS)
      .cookie('__auth.access', accessToken, {
        ...COOKIE_OPTIONS,
        httpOnly: true,
      });

    return res.redirect(`${env.FRONTEND_URL}/auth/callback`);
  }

  static oAuthError(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    const message = encodeURIComponent(err.message || 'Authentication failed');
    return res.redirect(`${env.FRONTEND_URL}/login?error=${message}`);
  }

  static async refreshAccessToken(req: Request, res: Response) {
    const refreshToken = req.cookies['__auth.refresh'];

    if (!refreshToken) {
      throw new ApiError(401, 'Authentication required. Please sign in.');
    }

    const result = await AuthService.refreshAccessToken(refreshToken);

    res
      .cookie('__auth.refresh', result.refreshToken, COOKIE_OPTIONS)
      .cookie('__auth.access', result.accessToken, {
        ...COOKIE_OPTIONS,
        httpOnly: true,
      })
      .json(new ApiResponse(200, 'Access token successfully refreshed'));
  }

  static async logout(req: Request, res: Response) {
    const refreshToken = req.cookies['__auth.refresh'];

    if (!refreshToken) {
      throw new ApiError(401, 'Authentication required. Please sign in.');
    }

    const result = await AuthService.logout(refreshToken);

    res
      .clearCookie('__auth.refresh', COOKIE_OPTIONS)
      .clearCookie('__auth.access', {
        ...COOKIE_OPTIONS,
        httpOnly: true,
      })
      .json(new ApiResponse(200, result.message));
  }

  static async logoutAll(req: Request, res: Response) {
    const userId = req.user!.id;

    const result = await AuthService.logoutAll(userId);

    res
      .clearCookie('__auth.refresh', COOKIE_OPTIONS)
      .clearCookie('__auth.access', {
        ...COOKIE_OPTIONS,
        httpOnly: true,
      })
      .json(new ApiResponse(200, result.message));
  }

  static async updateUser(req: Request, res: Response) {
    const userId = req.user!.id;

    const updatedUser = await AuthService.updateUser(userId, req.body);
    res.json(
      new ApiResponse(200, 'User successfully updated', { updatedUser })
    );
  }

  static async deleteUser(req: Request, res: Response) {
    const userId = req.user!.id;

    await AuthService.deleteUser(userId);

    res.clearCookie('__auth.refresh', COOKIE_OPTIONS);
    res.json(
      new ApiResponse(200, 'Your account has been deleted successfully')
    );
  }
}
