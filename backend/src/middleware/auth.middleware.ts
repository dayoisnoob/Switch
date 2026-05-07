import type { NextFunction, Request, Response } from 'express';
import { COOKIE_OPTIONS } from '../constants.ts';
import { AuthService } from '../services/auth.service.ts';
import { ApiError } from '../utils/api-response.js';
import { jwtVerify } from '../utils/jwt.util.js';
import type { AuthenticatedRequest } from '../types/express';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies['__auth.access'];

    if (!accessToken?.trim()) {
      return next(
        new ApiError(401, 'Authentication required. Please sign in.')
      );
    }

    try {
      const decoded = jwtVerify(accessToken);

      if (!decoded.isActive) {
        return next(new ApiError(403, 'Your account has been suspended.'));
      }

      req.user = decoded;
      return next();
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Token expired.'));
      }
      return next(new ApiError(401, 'Invalid access token.'));
    }
  } catch (err) {
    next(new ApiError(401, 'Authentication failed.'));
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

export const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies['__auth.access'];
    if (token) {
      const payload = jwtVerify(token);
      req.user = payload;
    }
  } catch {}
  next();
};
