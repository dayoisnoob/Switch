import { asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../config/db';
import { cardsTable, columnsTable } from '../db';
import { ApiError } from '../utils/api-response';
import { emitBoardEvent } from '../socket/emitter';
import type { CreateColumn } from '../validations/projects.validation';

export class ColumnsService {
  static async createColumn(
    userId: string,
    actorName: string,
    boardId: string,
    data: CreateColumn
  ) {
    const { name, mappedStatus } = data;

    console.log(name, mappedStatus);

    const column = await db.transaction(async (tx) => {
      const [lastColumn] = await tx
        .select({
          newOrder: sql<number>`coalesce(max(${columnsTable.order}), 0)+ 1`,
        })
        .from(columnsTable)
        .where(eq(columnsTable.boardId, boardId))
        .limit(1);

      const [column] = await db
        .insert(columnsTable)
        .values({
          boardId,
          name,
          mappedStatus,
          order: lastColumn?.newOrder ?? 1,
        })
        .returning();

      if (!column)
        throw new ApiError(500, 'Error creating column. Please try again.');

      return column;
    });

    emitBoardEvent(boardId, 'column:created', {
      column: column,
      actorName,
      actorId: userId,
    });

    return {
      id: column.id,
      name: column.name,
      order: column.order,
      mappedStatus: mappedStatus,
      cards: [],
    };
  }

  static async updateColumnName(
    userId: string,
    actorName: string,
    columnId: string,
    name: string
  ) {
    const [updatedColumn] = await db
      .update(columnsTable)
      .set({ name })
      .where(eq(columnsTable.id, columnId))
      .returning();

    if (!updatedColumn)
      throw new ApiError(500, 'Error updating column, Please try again');

    emitBoardEvent(updatedColumn.boardId, 'column:updated', {
      columnId: updatedColumn.id,
      colName: updatedColumn.name,
      actorName,
      actorId: userId,
    });

    return updatedColumn;
  }

  static async updateColumnOrder(
    userId: string,
    actorName: string,
    columnId: string,
    order: number
  ) {
    const [updatedColumn] = await db
      .update(columnsTable)
      .set({ order })
      .where(eq(columnsTable.id, columnId))
      .returning();

    if (!updatedColumn)
      throw new ApiError(500, 'Error updating column, Please try again');

    emitBoardEvent(updatedColumn.boardId, 'column:reordered', {
      colId: updatedColumn.id,
      newOrder: order,
      actorId: userId,
      actorName,
      colName: updatedColumn.name,
    });

    return {
      id: updatedColumn.id,
      name: updatedColumn.name,
      order: updatedColumn.order,
      mappedStatus: updatedColumn.mappedStatus,
    };
  }

  static async deleteColumn(
    userId: string,
    actorName: string,
    columnId: string
  ) {
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

    if (!deletedColumn) throw new ApiError(404, 'Column not found');

    emitBoardEvent(deletedColumn.boardId, 'column:deleted', {
      columnId: deletedColumn.id,
      actorName,
      actorId: userId,
      colName: deletedColumn.name,
    });

    return deletedColumn;
  }

  static async deleteCards(
    userId: string,
    actorName: string,
    columnId: string
  ) {
    const [column] = await db
      .select({
        id: columnsTable.id,
        boardId: columnsTable.boardId,
        name: columnsTable.name,
      })
      .from(columnsTable)
      .where(eq(columnsTable.id, columnId))
      .limit(1);

    if (!column) {
      throw new ApiError(404, 'Column not found.');
    }

    const deletedCards = await db
      .delete(cardsTable)
      .where(eq(cardsTable.columnId, columnId))
      .returning();

    if (deletedCards.length === 0)
      throw new ApiError(500, 'Error deleting cards, Please try again');

    emitBoardEvent(column.boardId, 'cards:deleted', {
      columnId: column.id,
      actorName,
      actorId: userId,
      colName: column.name,
    });

    return column;
  }

  static async moveAllCards(
    columnId: string,
    targetColumnId: string,
    actorId: string,
    actorName: string
  ) {
    const [targetColumn] = await db
      .select({
        id: columnsTable.id,
        boardId: columnsTable.boardId,
        name: columnsTable.name,
      })
      .from(columnsTable)
      .where(eq(columnsTable.id, targetColumnId))
      .limit(1);

    if (!targetColumn) throw new ApiError(404, 'Target column not found.');

    const [result] = await db
      .select({ maxOrder: sql<number>`coalesce(max(${cardsTable.order}), 0)` })
      .from(cardsTable)
      .where(eq(cardsTable.columnId, targetColumnId));

    const maxOrder = result?.maxOrder ?? 0;

    const cards = await db
      .select({ id: cardsTable.id, order: cardsTable.order })
      .from(cardsTable)
      .where(eq(cardsTable.columnId, columnId))
      .orderBy(asc(cardsTable.order));

    if (cards.length === 0) throw new ApiError(409, 'No cards to move.');

    await db.transaction(async (tx) => {
      const updatePromises = cards.map((card, i) => {
        return tx
          .update(cardsTable)
          .set({ columnId: targetColumnId, order: maxOrder + i + 1 })
          .where(eq(cardsTable.id, card.id));
      });

      await Promise.all(updatePromises);
    });

    emitBoardEvent(targetColumn.boardId, 'cards:moved', {
      fromColumnId: columnId,
      toColumnId: targetColumnId,
      actorId,
      actorName,
    });
  }

  static async getColumn(columnId: string) {
    const [column] = await db
      .select({
        id: columnsTable.id,
        name: columnsTable.name,
        order: columnsTable.order,
        cardCount: sql<number>`count(${cardsTable.id})`.mapWith(Number),
      })
      .from(columnsTable)
      .leftJoin(cardsTable, eq(cardsTable.columnId, columnsTable.id))
      .where(eq(columnsTable.id, columnId))
      .groupBy(columnsTable.id)
      .orderBy(columnsTable.order);

    if (!column) throw new ApiError(404, 'Column not found');

    return column;
  }
}
