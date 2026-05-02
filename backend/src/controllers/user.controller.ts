import type { Response } from 'express';
import { UserService } from '../services/user.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../utils/api-response';

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

  static async getUserActiveProjectsCount(
    req: AuthenticatedRequest,
    res: Response
  ) {
    const userId = req.user.id;
    const count = await UserService.getUserActiveProjectsCount(userId);

    res.json(
      new ApiResponse(200, 'Projects retrieved successfully', { count })
    );
  }
}
