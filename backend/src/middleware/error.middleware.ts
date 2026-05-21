import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/api-response';
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
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
    });
  }

  const error =
    err instanceof ApiError
      ? err
      : new ApiError(
          err.statusCode || 500,
          err.message || 'Internal server error'
        );

  logger.error({
    statusCode: error.statusCode,
    message: error.message,
    path: req.originalUrl,
    method: req.method,
    stack: !error.isOperational ? error.stack : undefined,
  });

  const response: any = {
    success: false,
    message: error.isOperational
      ? error.message
      : 'Something went wrong. Please try again.',
    errors: error.errors,
  };

  res.status(error.statusCode).json(response);
};
