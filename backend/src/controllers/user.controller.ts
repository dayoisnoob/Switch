import type { Response } from 'express';
import { BoardService } from '../services/board.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../utils/api-response';
import { UserService } from '../services/user.service';

export class UserController {
  static async getMe(req: AuthenticatedRequest, res: Response) {
    const user = await UserService.getMe(req.user.id);

    res.json(new ApiResponse(200, 'User retrieved successfully', user));
  }

  static async getAllTeamMembersCount(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const count = await UserService.getAllTeamMembersCount(req.user.id);

    res.json(new ApiResponse(200, 'Members successfully retrieved', { count }));
  }
}
