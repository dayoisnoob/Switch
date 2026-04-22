import type { NextFunction, Request, Response } from 'express';
import { cache } from '../config/redis';

export const cacheMiddleware = (ttlSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;

    const cached = await cache.get(key);
    if (cached) {
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode === 200) {
        cache.set(key, body, ttlSeconds).catch(() => {});
      }
      return originalJson(body);
    };

    next();
  };
};
