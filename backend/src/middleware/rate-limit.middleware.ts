import { type Request } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

interface createLimiterInterface {
  keyGenerator: (req: Request) => string | undefined;
  max: number;
  windowMinutes: number;
  message?: string;
}

const createLimiter = ({
  keyGenerator,
  max,
  windowMinutes,
  message,
}: createLimiterInterface) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    keyGenerator: (req) => {
      const key = keyGenerator(req);
      return key ?? ipKeyGenerator(req.ip ?? '127.0.0.1');
    },
    handler: (req, res) => {
      res.status(429).json({
        statusCode: 429,
        message: message || 'Too many requests. Try again later.',
        data: null,
      });
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

export const loginEmailLimiter = createLimiter({
  keyGenerator: (req) => req.body.email,
  max: 5,
  windowMinutes: 15,
  message: 'Too many login attempts for this email. Wait 15 minutes.',
});
export const loginIpLimiter = createLimiter({
  keyGenerator: (req) => req.ip,
  max: 10,
  windowMinutes: 60,
});

export const forgotPasswordRecentLimiter = createLimiter({
  keyGenerator: (req) => `${req.ip}-${req.body.email}`,
  max: 3,
  windowMinutes: 10,
});
export const forgotPasswordHourlyLimiter = createLimiter({
  keyGenerator: (req) => `${req.ip}-${req.body.email}`,
  max: 5,
  windowMinutes: 60,
});

export const resetPasswordLimiter = createLimiter({
  keyGenerator: (req) => `${req.ip}-${req.query.token as string}`,
  max: 5,
  windowMinutes: 15,
});

export const registerIpLimiter = createLimiter({
  keyGenerator: (req) => req.ip,
  max: 5,
  windowMinutes: 60,
});

export const resendVerificationLimiter = createLimiter({
  keyGenerator: (req) => `${req.ip}-${req.body.email}`,
  max: 3,
  windowMinutes: 10,
});

export const changePasswordLimiter = createLimiter({
  keyGenerator: (req) => req.user!.id,
  max: 5,
  windowMinutes: 60,
  message: 'Too many attempts. Wait 1 hour.',
});

export const refreshTokenLimiter = createLimiter({
  keyGenerator: (req) => req.ip,
  max: 60,
  windowMinutes: 60,
});

export const globalLimiter = createLimiter({
  keyGenerator: (req) => req.ip,
  windowMinutes: 15,
  max: 100,
});
