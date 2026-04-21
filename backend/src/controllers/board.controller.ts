import type { Response } from 'express';
import { BoardService } from '../services/board.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../utils/api-response';
import { getParam } from '../utils/params.util';

export class BoardController {
  static async getBoardState(req: AuthenticatedRequest, res: Response) {
    const projectId = getParam(req.params.projectId, 'projectId');

    const boardState = await BoardService.getBoardState(projectId);

    res.json(new ApiResponse(200, 'Board successfully retrieved', boardState));
  }
}
