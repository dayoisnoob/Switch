import type { Request, Response } from 'express';
import { WorkspaceService } from '../services/workspace.service';
import { ApiResponse } from '../utils/api-response';

export class WorkspaceController {
  static async createWorkspace(req: Request, res: Response) {
    const userId = req.user!.id;
    const { name } = req.body;

    const { workspace, membership } = await WorkspaceService.createWorkspace(
      userId,
      name
    );

    res.status(201).json(
      new ApiResponse(201, 'Workspace successfully created', {
        workspace,
        membership,
      })
    );
  }

  static async getAllWorkspaces(req: Request, res: Response) {
    const userId = req.user!.id;

    const workspaces = await WorkspaceService.getAllWorkspaces(userId);

    res.json(
      new ApiResponse(200, 'Workspaces successfully retrieved', workspaces)
    );
  }
}
