import { ActivityService } from '../services/activity.service';
import type { AuthenticatedRequest } from '../types/express';
import type { Response } from 'express';
import { ApiResponse } from '../utils/api-response';

export class ActivityController {
  static async getLogs(req: AuthenticatedRequest, res: Response) {
    const cardId = req.params.cardId as string;
    const cursor = req.query.cursor as string | undefined;

    const result = await ActivityService.getLogs(cardId, cursor);

    res.json(new ApiResponse(200, 'Logs retrieved successfully.', result));
  }
}
