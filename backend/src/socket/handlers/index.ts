import type { Server, Socket } from 'socket.io';
import { logger } from '../../config/logger';

export const registerSocketHandlers = (io: Server, socket: Socket) => {
  // client opens a board
  socket.on('join:board', ({ boardId }: { boardId: string }) => {
    socket.join(`board:${boardId}`);
    logger.info({ userId: socket.data.userId, boardId }, 'Joined board room');

    // broadcast updated presence to everyone in the room
    broadcastPresence(io, `board:${boardId}`);
  });

  // client navigates away from a board
  socket.on('leave:board', ({ boardId }: { boardId: string }) => {
    socket.leave(`board:${boardId}`);
    logger.info({ userId: socket.data.userId, boardId }, 'Left board room');

    broadcastPresence(io, `board:${boardId}`);
  });

  // also update presence when socket disconnects entirely
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) => {
      if (room.startsWith('board:')) {
        broadcastPresence(io, room);
      }
    });
  });
};

// collect all sockets in a room and broadcast who's present
const broadcastPresence = (io: Server, room: string) => {
  const socketsInRoom = io.sockets.adapter.rooms.get(room);

  const users = socketsInRoom
    ? Array.from(socketsInRoom).map((socketId) => {
        const s = io.sockets.sockets.get(socketId);
        return {
          userId: s?.data.userId,
          firstName: s?.data.firstName,
          avatarUrl: s?.data.avatarUrl,
        };
      })
    : [];

  io.to(room).emit('board:presence', { users });
};
