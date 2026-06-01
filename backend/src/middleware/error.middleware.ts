import type { NextFunction, Request, Response } from 'express';
import { ApiError, ApiResponse } from '../utils/api-response';
import { logger } from '../config/logger';
import { DatabaseError } from 'pg';

export const notFoundError = (req: Request, res: Response) => {
  throw new ApiError(404, 'The requested resource was not found');
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof DatabaseError && err.code === '23505') {
    return res
      .status(409)
      .json(new ApiResponse(409, 'Resource already exists', null));
  }

  if (err.name === 'TokenExpiredError') {
    err = new ApiError(401, 'This link has expired. Please request a new one.');
  } else if (err.name === 'JsonWebTokenError') {
    err = new ApiError(401, 'Invalid authentication token.');
  }

  const error =
    err instanceof ApiError
      ? err
      : new ApiError(500, 'Something went wrong. Please try again.');

  logger.error({
    statusCode: error.statusCode,
    message: error.message,
    path: req.originalUrl,
    method: req.method,
    stack: !error.isOperational ? error.stack : undefined,
  });

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
  };

  res.status(error.statusCode).json(response);
};
