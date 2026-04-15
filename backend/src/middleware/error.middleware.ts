import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/api-response';
import { logger } from '../config/logger';

export const notFoundError = (req: Request, res: Response) => {
  throw new ApiError(404, `Route: ${req.originalUrl} not found`);
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    ip: req.ip,
    stack: !error.isOperational ? error.stack : undefined,
  });

  const response: any = {
    success: false,
    message: error.isOperational ? error.message : 'Internal server error',
    details: error.details,
    errors: error.errors,
  };

  res.status(error.statusCode).json(response);
};
