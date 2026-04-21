import { desc, eq } from 'drizzle-orm';
import { db } from '../config/db';
import { cardsTable, columnsTable } from '../db';
import { ApiError } from '../utils/api-response';

export class ColumnsService {
  static async createColumn(boardId: string, name: string) {
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
        order: newOrder,
      })
      .returning();

    if (!column)
      throw new ApiError(500, 'Error creating column. Please try again.');

    return column;
  }

  static async updateColumnName(columnId: string, name: string) {
    const [updatedColumn] = await db
      .update(columnsTable)
      .set({ name })
      .where(eq(columnsTable.id, columnId))
      .returning();

    if (!updatedColumn)
      throw new ApiError(500, 'Error updating column, Please try again');

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

    return updatedColumn;
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

    return deletedColumn;
  }
}
