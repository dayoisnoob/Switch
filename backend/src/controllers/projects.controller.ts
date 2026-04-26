import type { Response } from 'express';
import { ProjectService } from '../services/projects.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../utils/api-response';

export class ProjectController {
  static async createProject(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const workspaceId = req.workspace?.workspaceId!;
    const { name, description } = req.body;

    const project = await ProjectService.createProject(
      userId,
      workspaceId,
      name,
      description
    );

    res
      .status(201)
      .json(new ApiResponse(201, 'Project created successfully', project));
  }

  static async getAllProjects(req: AuthenticatedRequest, res: Response) {
    const workspaceId = req.workspace?.workspaceId!;
    const projects = await ProjectService.getAllProjects(workspaceId);

    res.json(new ApiResponse(200, 'Projects retrieved successfully', projects));
  }

  static async getProject(req: AuthenticatedRequest, res: Response) {
    const slug = req.params.projectSlug as string;
    const workspaceId = req.workspace?.workspaceId as string;

    const project = await ProjectService.getProject(workspaceId, slug);

    res.json(new ApiResponse(200, 'Project retrieved successfully', project));
  }

  static async updateProject(req: AuthenticatedRequest, res: Response) {
    const projectId = req.params.projectId as string;
    const workspaceId = req.workspace?.workspaceId as string;

    const { name, description } = req.body;
    const project = await ProjectService.updateProject(
      workspaceId,
      projectId,
      name,
      description
    );

    res.json(new ApiResponse(200, 'Project updated successfully', project));
  }

  static async deleteProject(req: AuthenticatedRequest, res: Response) {
    const projectId = req.params.projectId as string;
    const workspaceId = req.workspace?.workspaceId as string;

    const project = await ProjectService.deleteProject(workspaceId, projectId);

    res.json(new ApiResponse(200, 'Project deleted successfully', project));
  }
}
