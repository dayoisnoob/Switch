import type { Request, Response } from 'express';
import { InvitationsService } from '../services/invitations.service';
import { ApiResponse } from '../utils/api-response';
import { getParam } from '../utils/params.util';

export class InvitationsController {
  static async acceptInvitation(req: Request, res: Response) {
    const token = getParam(req.params.token, 'token');

    const result = await InvitationsService.acceptInvitation(token);

    if (result.requiresRegistration) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, 'Please register to accept this invitation.')
        );
    }

    res.json(new ApiResponse(200, result.message));
  }
}
