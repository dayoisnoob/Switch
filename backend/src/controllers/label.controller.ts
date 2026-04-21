import type { Response } from 'express';
import { LabelService } from '../services/label.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../utils/api-response';
import { getParam } from '../utils/params.util';

export class LabelController {
  static async createLabel(req: AuthenticatedRequest, res: Response) {
    const workspaceId = getParam(req.params.workspaceId, 'workspaceId');
    const label = await LabelService.createLabel(workspaceId, req.body);

    res
      .status(201)
      .json(new ApiResponse(200, 'Label successfully created', label));
  }

  static async listLabels(req: AuthenticatedRequest, res: Response) {
    const workspaceId = getParam(req.params.workspaceId, 'workspaceId');
    const labels = await LabelService.listLabels(workspaceId);

    res.json(new ApiResponse(200, 'Labels successfully retrieved', labels));
  }

  static async updateLabel(req: AuthenticatedRequest, res: Response) {
    const labelId = getParam(req.params.labelId, 'labelId');
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
    const labelId = getParam(req.params.labelId, 'labelId');
    const workspaceId = req.resolvedLabel?.workspaceId!;

    const label = await LabelService.deleteLabel(workspaceId, labelId);

    res
      .status(201)
      .json(new ApiResponse(200, 'Label successfully deleted', label));
  }
}
