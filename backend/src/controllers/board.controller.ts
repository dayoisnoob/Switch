import type { Request, Response } from 'express';
import { BoardService } from '../services/board.service';
import { ApiResponse } from '../utils/api-response';

export class BoardController {
  static async getBoardState(req: Request, res: Response) {
    const userId = req.user!.id;
    const { workspaceId, projectId } = req.params;

    const boardState = await BoardService.getBoardState(
      userId,
      workspaceId as string,
      projectId as string
    );

    res.json(new ApiResponse(200, 'Board successfully retrieved', boardState));
  }
}
