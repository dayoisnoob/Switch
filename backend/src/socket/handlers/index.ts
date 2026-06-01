import type { Server, Socket } from 'socket.io';
import { logger } from '../../config/logger';

export const registerSocketHandlers = (io: Server, socket: Socket) => {
  socket.join(`user:${socket.data.userId}`);

  socket.on('join:board', ({ boardId }: { boardId: string }) => {
    socket.join(`board:${boardId}`);
    logger.info({ userId: socket.data.userId, boardId }, 'Joined board room');

    broadcastPresence(io, `board:${boardId}`);
  });

  socket.on('leave:board', ({ boardId }: { boardId: string }) => {
    socket.leave(`board:${boardId}`);
    logger.info({ userId: socket.data.userId, boardId }, 'Left board room');

    broadcastPresence(io, `board:${boardId}`);
  });

  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) => {
      if (room.startsWith('board:')) {
        broadcastPresence(io, room);
      }
    });
  });
};

const broadcastPresence = (io: Server, room: string) => {
  const socketsInRoom = io.sockets.adapter.rooms.get(room);
  if (!socketsInRoom) return;

  const seen = new Set<string>();
  const users = [];

  for (const socketId of socketsInRoom) {
    const s = io.sockets.sockets.get(socketId);
    if (!s) continue;
    if (seen.has(s.data.userId)) continue;
    seen.add(s.data.userId);
    users.push({
      userId: s.data.userId,
      firstName: s.data.firstName,
      lastName: s.data.lastName,
      avatarUrl: s.data.avatarUrl,
    });
  }

  io.to(room).emit('board:presence', { users });
};
