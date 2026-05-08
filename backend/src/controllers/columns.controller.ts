import type { Response } from 'express';
import { ColumnsService } from '../services/columns.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../utils/api-response';

export class ColumnsController {
  static async createColumn(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const actorName = `${req.user?.firstName} ${req.user?.lastName}`.trim();

    const boardId = req.params.boardId as string;

    const column = await ColumnsService.createColumn(
      userId,
      actorName,
      boardId,
      req.body
    );
    res
      .status(201)
      .json(new ApiResponse(201, 'Column successfully created', column));
  }

  static async updateColumnName(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const actorName = `${req.user?.firstName} ${req.user?.lastName}`.trim();
    const columnId = req.params.columnId as string;

    const { name } = req.body;
    const column = await ColumnsService.updateColumnName(
      userId,
      actorName,
      columnId,
      name
    );

    res.json(new ApiResponse(200, 'Column updated successfully', column));
  }

  static async updateColumnOrder(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const actorName = `${req.user?.firstName} ${req.user?.lastName}`.trim();
    const columnId = req.params.columnId as string;

    const { order } = req.body;
    const column = await ColumnsService.updateColumnOrder(
      userId,
      actorName,
      columnId,
      order
    );

    res.json(new ApiResponse(200, 'Column updated successfully', column));
  }

  static async deleteColumn(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const actorName = `${req.user?.firstName} ${req.user?.lastName}`.trim();
    const columnId = req.params.columnId as string;

    const column = await ColumnsService.deleteColumn(
      userId,
      actorName,
      columnId
    );

    res.json(new ApiResponse(200, 'Column deleted successfully', column));
  }

  static async deleteCards(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const actorName = `${req.user?.firstName} ${req.user?.lastName}`.trim();
    const columnId = req.params.columnId as string;

    const column = await ColumnsService.deleteCards(
      userId,
      actorName,
      columnId
    );

    res.json(new ApiResponse(200, 'Cards deleted successfully', column));
  }
}
