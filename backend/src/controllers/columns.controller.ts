import type { Request, Response } from 'express';
import { ColumnsService } from '../services/columns.service';
import type {
  AuthenticatedRequest,
  BoardParams,
  ColumnParams,
} from '../types/express';
import { ApiResponse } from '../utils/api-response';
import { getParam } from '../utils/params.util';

export class ColumnsController {
  static async createColumn(req: AuthenticatedRequest, res: Response) {
    const boardId = getParam(req.params.boardId, 'boardId');
    const { name } = req.body;

    const column = await ColumnsService.createColumn(boardId, name);
    res
      .status(201)
      .json(new ApiResponse(201, 'Column successfully created', column));
  }

  static async updateColumnName(req: AuthenticatedRequest, res: Response) {
    const columnId = getParam(req.params.columnId, 'columnId');

    const { name } = req.body;
    const column = await ColumnsService.updateColumnName(columnId, name);

    res.json(new ApiResponse(200, 'Column updated successfully', column));
  }

  static async updateColumnOrder(req: AuthenticatedRequest, res: Response) {
    const columnId = getParam(req.params.columnId, 'columnId');

    const { order } = req.body;
    const column = await ColumnsService.updateColumnOrder(columnId, order);

    res.json(new ApiResponse(200, 'Column updated successfully', column));
  }

  static async deleteColumn(req: AuthenticatedRequest, res: Response) {
    const columnId = getParam(req.params.columnId, 'columnId');

    const column = await ColumnsService.deleteColumn(columnId);

    res.json(new ApiResponse(200, 'Column deleted successfully', column));
  }
}
