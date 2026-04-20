import type { Request, Response } from 'express';
import { InvitationsService } from '../services/invitations.service';
import { ApiResponse } from '../utils/api-response';

export class InvitationsController {
  static async acceptInvitation(req: Request, res: Response) {
    const result = await InvitationsService.acceptInvitation(
      req.params.token as string
    );

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
