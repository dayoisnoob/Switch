import type { Socket } from 'socket.io';
import { env } from '../config/env';
import { jwtVerify } from '../utils/jwt.util';

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required.'));
    }

    const decoded = jwtVerify(token, env.ACCESS_TOKEN_SECRET);

    socket.data.userId = decoded.id;
    socket.data.firstName = decoded.firstName;
    socket.data.lastName = decoded.lastName;
    socket.data.avatarUrl = decoded.avatarUrl;

    next();
  } catch {
    next(new Error('Invalid or expired token.'));
  }
};
