import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { socketAuthMiddleware } from './middleware';
import { registerSocketHandlers } from './handlers';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    logger.info({ userId: socket.data.userId }, 'Socket connected');
    registerSocketHandlers(io, socket);

    socket.on('disconnect', () => {
      logger.info({ userId: socket.data.userId }, 'Socket disconnected');
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
