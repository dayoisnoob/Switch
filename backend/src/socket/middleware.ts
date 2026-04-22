import { parse } from 'cookie';
import type { Socket } from 'socket.io';
import { env } from '../config/env';
import { jwtVerify } from '../utils/jwt.util';

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error('Authentication required.'));
    }

    const cookies = parse(cookieHeader);
    const token = cookies['__auth.access'];

    if (!token) {
      return next(new Error('Authentication required.'));
    }

    const decoded = jwtVerify(token, env.ACCESS_TOKEN_SECRET);

    socket.data.userId = decoded.id;
    socket.data.firstName = decoded.firstName;

    next();
  } catch {
    next(new Error('Invalid or expired token.'));
  }
};
