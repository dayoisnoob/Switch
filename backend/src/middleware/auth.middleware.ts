import type { NextFunction, Request, Response } from 'express';
import { COOKIE_OPTIONS } from '../constants.ts';
import { AuthService } from '../services/auth.service.ts';
import { ApiError } from '../utils/api-response.js';
import { jwtVerify } from '../utils/jwt.util.js';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies['__auth.access'];
    const refreshToken = req.cookies['__auth.refresh'];

    if (accessToken?.trim()) {
      try {
        const decoded = jwtVerify(accessToken);

        if (!decoded.isActive) {
          return next(new ApiError(403, 'Your account has been suspended.'));
        }

        req.user = decoded;
        return next();
      } catch (err: any) {
        if (err.name !== 'TokenExpiredError') {
          return next(new ApiError(401, 'Invalid access token'));
        }
      }
    }

    if (!refreshToken?.trim()) {
      return next(
        new ApiError(401, 'Authentication required. Please sign in.')
      );
    }

    const result = await AuthService.refreshAccessToken(refreshToken);

    res
      .cookie('__auth.refresh', result.refreshToken, COOKIE_OPTIONS)
      .cookie('__auth.access', result.accessToken, {
        ...COOKIE_OPTIONS,
        httpOnly: false,
      });

    req.user = jwtVerify(result.accessToken);

    return next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, 'Authentication failed'));
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required'));
  }
  next();
};
