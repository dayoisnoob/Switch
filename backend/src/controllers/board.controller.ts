import type { Response } from 'express';
import { BoardService } from '../services/board.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../utils/api-response';

export class BoardController {
  static async getBoardState(req: AuthenticatedRequest, res: Response) {
    const projectId = req.params.projectId as string

    const boardState = await BoardService.getBoardState(projectId);

    res.json(new ApiResponse(200, 'Board successfully retrieved', boardState));
  }
}
