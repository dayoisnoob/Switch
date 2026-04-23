import type { Request, Response } from 'express';
import { WorkspaceService } from '../services/workspaces.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiError, ApiResponse } from '../utils/api-response';

export class WorkspaceController {
  static async createWorkspace(req: AuthenticatedRequest, res: Response) {
    const { workspace, membership } = await WorkspaceService.createWorkspace(
      req.user.id,
      req.body.name
    );

    res.status(201).json(
      new ApiResponse(201, 'Workspace successfully created', {
        workspace,
        membership,
      })
    );
  }

  static async getWorkspace(req: AuthenticatedRequest, res: Response) {
    const workspaceId = req.workspace?.workspaceId!;
    const result = await WorkspaceService.getWorkspace(workspaceId);

    const workspace = { ...result, role: req.workspace?.role };

    res.json(
      new ApiResponse(200, 'Workspace successfully retrieved', workspace)
    );
  }

  static async getAllWorkspaces(req: AuthenticatedRequest, res: Response) {
    const workspaces = await WorkspaceService.getAllWorkspaces(req.user.id);

    res.json(
      new ApiResponse(200, 'Workspaces successfully retrieved', workspaces)
    );
  }

  static async updateWorkspace(req: AuthenticatedRequest, res: Response) {
    const workspaceId = req.workspace?.workspaceId!;

    const updatedWorkspace = await WorkspaceService.updateWorkspace(
      req.body.name,
      workspaceId
    );

    res.json(
      new ApiResponse(200, 'Workspace successfully updated', updatedWorkspace)
    );
  }

  static async deleteWorkspace(req: AuthenticatedRequest, res: Response) {
    const workspaceId = req.workspace?.workspaceId!;
    await WorkspaceService.deleteWorkspace(req.user.id, workspaceId);

    res.json(new ApiResponse(200, 'Workspace successfully deleted'));
  }

  static async getMembers(req: AuthenticatedRequest, res: Response) {
    const workspaceId = req.workspace?.workspaceId!;

    const members = await WorkspaceService.getMembers(req.user.id, workspaceId);

    res.json(new ApiResponse(200, 'Members successfully retrieved', members));
  }

  static async removeMember(req: AuthenticatedRequest, res: Response) {
    const workspaceId = req.workspace?.workspaceId!;
    const userId = req.params.userId as string;

    await WorkspaceService.removeMember(userId, workspaceId);

    res.json(new ApiResponse(200, 'Member successfully removed'));
  }

  static async sendInvitation(req: AuthenticatedRequest, res: Response) {
    const workspaceId = req.workspace?.workspaceId!;

    const inviterName = req.user.firstName;
    const workspaceName = req.workspace?.workspaceName;

    if (!workspaceName) throw new ApiError(500, 'Workspace context missing');

    await WorkspaceService.sendInvitation(
      req.user.id,
      req.body.email,
      workspaceId,
      inviterName,
      workspaceName
    );

    res.json(new ApiResponse(200, 'Invitation sent successfully'));
  }
}
