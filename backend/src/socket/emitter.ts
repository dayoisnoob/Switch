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
  | 'comment:created'
  | 'comment:updated'
  | 'comment:deleted';

export const emitBoardEvent = (
  boardId: string,
  event: BoardEvent,
  payload: Record<string, unknown>
) => {
  try {
    getIO().to(`board:${boardId}`).emit(event, payload);
  } catch (err) {
    console.error('Socket emit failed:', err);
  }
};
