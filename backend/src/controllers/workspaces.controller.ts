import type { Request, Response } from 'express';
import { WorkspaceService } from '../services/workspaces.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiError, ApiResponse } from '../utils/api-response';

export class WorkspaceController {
  static async createWorkspace(req: AuthenticatedRequest, res: Response) {
    const data = await WorkspaceService.createWorkspace(req.user.id, req.body);

    res
      .status(201)
      .json(new ApiResponse(201, 'Workspace successfully created', data));
  }

  static async getWorkspace(req: AuthenticatedRequest, res: Response) {
    const workspaceId = req.workspace?.workspaceId!;
    const userId = req.user.id;

    const workspace = await WorkspaceService.getWorkspace(workspaceId, userId);

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
      workspaceId,
      req.body
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

    const members = await WorkspaceService.getWorkspaceMembers(
      req.user.id,
      workspaceId
    );

    res.json(new ApiResponse(200, 'Members successfully retrieved', members));
  }

  static async updateMemberRole(req: AuthenticatedRequest, res: Response) {
    const memberId = req.params.userId as string;
    const workspaceId = req.workspace?.workspaceId!;
    const requesterRole = req.workspace!.role;
    const { role } = req.body;

    const members = await WorkspaceService.updateMemberRole(
      memberId,
      workspaceId,
      requesterRole,
      role
    );

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

    const inviterName = `${req.user.firstName} ${req.user.lastName}`.trim();
    const workspaceName = req.workspace!.workspaceName;

    if (!workspaceName) throw new ApiError(500, 'Workspace context missing');

    await WorkspaceService.sendInvitation(
      req.user.id,
      req.body,
      workspaceId,
      inviterName,
      workspaceName
    );

    res.json(new ApiResponse(200, 'Invitation sent successfully'));
  }

  static async getPendingInvites(req: AuthenticatedRequest, res: Response) {
    const workspaceId = req.workspace?.workspaceId!;

    const pendingInvites =
      await WorkspaceService.getPendingInvites(workspaceId);

    res.json(
      new ApiResponse(
        200,
        'Pending invitations successfully retrieved',
        pendingInvites
      )
    );
  }

  static async revokeInvite(req: AuthenticatedRequest, res: Response) {
    const workspaceId = req.workspace?.workspaceId!;
    const email = req.params.email as string;

    await WorkspaceService.revokeInvite(workspaceId, email);

    res.json(new ApiResponse(200, 'Invite successfully revoked'));
  }

  static async resendInvitation(req: AuthenticatedRequest, res: Response) {
    const workspaceId = req.workspace?.workspaceId!;
    const inviterName = req.user.firstName;
    const workspaceName = req.workspace?.workspaceName;

    if (!workspaceName) throw new ApiError(500, 'Workspace context missing');

    await WorkspaceService.resendInvite(
      workspaceId,
      req.body.email,
      inviterName,
      workspaceName
    );

    res.json(new ApiResponse(200, 'Invitation sent successfully'));
  }

  static async leaveWorkspace(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const workspaceId = req.workspace?.workspaceId!;

    await WorkspaceService.leaveWorkspace(userId, workspaceId);

    res.json(new ApiResponse(200, 'You have left the workspace.', null));
  }
}
