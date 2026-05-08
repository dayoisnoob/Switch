import { logger } from '../config/logger';
import { getIO } from './index';

type BoardEvent =
  | 'card:created'
  | 'card:updated'
  | 'card:moved'
  | 'card:deleted'
  | 'column:created'
  | 'column:updated'
  | 'column:reordered'
  | 'column:deleted'
  | 'cards:deleted'
  | 'cards:moved'
  | 'assignee:added'
  | 'assignee:removed'
  | 'label:attached'
  | 'label:removed'
  | 'label:created'
  | 'label:deleted'
  | 'comment:created'
  | 'comment:updated'
  | 'comment:deleted'
  | 'attachment:uploaded'
  | 'attachment:deleted';

export const emitBoardEvent = (
  boardId: string,
  event: BoardEvent,
  payload: Record<string, unknown>
) => {
  try {
    getIO().to(`board:${boardId}`).emit(event, payload);
  } catch (err) {
    logger.error({ err }, 'Socket emit failed:');
  }
};

export const emitToUser = (
  userId: string,
  event: string,
  payload: Record<string, unknown>
) => {
  try {
    getIO().to(`user:${userId}`).emit(event, payload);
  } catch (err) {
    logger.error({ err }, 'User emit failed');
  }
};
