import type { Request, Response } from 'express';
import { WorkspaceService } from '../services/workspace.service';
import { ApiResponse } from '../utils/api-response';
import { ProjectService } from '../services/project.service';

export class ProjectController {
  static async createProject(req: Request, res: Response) {
    const userId = req.user!.id;
    const { workspaceId } = req.params;

    const { project, board } = await ProjectService.createProject(
      userId,
      workspaceId as string as string,
      req.body
    );

    res.status(201).json(
      new ApiResponse(201, 'Project successfully created', {
        project,
        board,
      })
    );
  }

  static async getAllProjects(req: Request, res: Response) {
    const userId = req.user!.id;
    const { workspaceId } = req.params;

    const projects = await ProjectService.getAllProjects(
      userId,
      workspaceId as string
    );

    res.json(new ApiResponse(200, 'Projects successfully retrieved', projects));
  }
}
