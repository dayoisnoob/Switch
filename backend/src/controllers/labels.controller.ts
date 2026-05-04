import type { Response } from 'express';
import { LabelService } from '../services/labels.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../utils/api-response';

export class LabelController {
  static async createLabel(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const actorName = `${req.user?.firstName} ${req.user?.lastName}`.trim();
    const workspaceId = req.workspace?.workspaceId!;
    const label = await LabelService.createLabel(
      userId,
      actorName,
      workspaceId,
      req.body
    );

    res
      .status(201)
      .json(new ApiResponse(201, 'Label successfully created', label));
  }

  static async listLabels(req: AuthenticatedRequest, res: Response) {
    const workspaceId = req.workspace?.workspaceId!;
    const labels = await LabelService.listLabels(workspaceId);

    res.json(new ApiResponse(200, 'Labels successfully retrieved', labels));
  }

  static async updateLabel(req: AuthenticatedRequest, res: Response) {
    const labelId = req.resolvedLabel?.id!;
    const workspaceId = req.resolvedLabel?.workspaceId!;

    const label = await LabelService.updateLabel(
      workspaceId,
      labelId,
      req.body
    );

    res
      .status(201)
      .json(new ApiResponse(200, 'Label successfully updated', label));
  }

  static async deleteLabel(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const actorName = `${req.user?.firstName} ${req.user?.lastName}`.trim();

    const labelId = req.params.labelId as string;
    const boardId = req.query.boardId as string;
    const workspaceId = req.workspace!.workspaceId;

    const label = await LabelService.deleteLabel(
      userId,
      actorName,
      labelId,
      boardId,
      workspaceId
    );

    res
      .status(201)
      .json(new ApiResponse(200, 'Label successfully deleted', label));
  }
}
