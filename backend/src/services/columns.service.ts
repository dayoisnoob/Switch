import { desc, eq } from 'drizzle-orm';
import { db } from '../config/db';
import { cardsTable, columnsTable } from '../db';
import { ApiError } from '../utils/api-response';
import { emitBoardEvent } from '../socket/emitter';

export class ColumnsService {
  static async createColumn(
    boardId: string,
    name: string,
    isCompleted: boolean
  ) {
    const [lastColumn] = await db
      .select({ order: columnsTable.order })
      .from(columnsTable)
      .where(eq(columnsTable.boardId, boardId))
      .orderBy(desc(columnsTable.order))
      .limit(1);

    const newOrder = lastColumn ? lastColumn.order + 1.0 : 1.0;
    const [column] = await db
      .insert(columnsTable)
      .values({
        boardId,
        name,
        ...(isCompleted && { isCompleted: true }),
        order: newOrder,
      })
      .returning();

    if (!column)
      throw new ApiError(500, 'Error creating column. Please try again.');

    emitBoardEvent(boardId, 'column:created', {
      columnId: column.id,
      name: column.name,
    });

    return {
      id: column.id,
      name: column.name,
      order: column.order,
      cards: [],
    };
  }

  static async updateColumnName(columnId: string, name: string) {
    const [updatedColumn] = await db
      .update(columnsTable)
      .set({ name })
      .where(eq(columnsTable.id, columnId))
      .returning();

    if (!updatedColumn)
      throw new ApiError(500, 'Error updating column, Please try again');

    emitBoardEvent(updatedColumn.boardId, 'column:updated', {
      columnId: updatedColumn.id,
      name: updatedColumn.name,
    });

    return updatedColumn;
  }

  static async updateColumnOrder(columnId: string, order: number) {
    const [updatedColumn] = await db
      .update(columnsTable)
      .set({ order })
      .where(eq(columnsTable.id, columnId))
      .returning();

    if (!updatedColumn)
      throw new ApiError(500, 'Error updating column, Please try again');

    emitBoardEvent(updatedColumn.boardId, 'column:reordered', {
      columnId: updatedColumn.id,
      order: updatedColumn.order,
    });

    return {
      id: updatedColumn.id,
      name: updatedColumn.name,
      order: updatedColumn.order,
    };
  }

  static async deleteColumn(columnId: string) {
    const [cardExists] = await db
      .select({ id: cardsTable.id })
      .from(cardsTable)
      .where(eq(cardsTable.columnId, columnId))
      .limit(1);

    if (cardExists) {
      throw new ApiError(
        409,
        'Cannot delete a column that contains cards. Please move or delete the cards first.'
      );
    }

    const [deletedColumn] = await db
      .delete(columnsTable)
      .where(eq(columnsTable.id, columnId))
      .returning();

    if (!deletedColumn)
      throw new ApiError(500, 'Error deleting column, Please try again');

    emitBoardEvent(deletedColumn.boardId, 'column:deleted', {
      columnId: deletedColumn.id,
      name: deletedColumn.name,
    });

    return deletedColumn;
  }
}
