import type { Request, Response } from 'express';
import { InvitationsService } from '../services/invitations.service';
import { ApiResponse } from '../utils/api-response';

export class InvitationsController {
  static async acceptInvitation(req: Request, res: Response) {
    const invitationtoken = req.params.token as string;

    const { requiresRegistration, token, message } =
      await InvitationsService.acceptInvitation(invitationtoken);

    if (requiresRegistration) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            'Please signup on Switch to accept this invitation.',
            { token }
          )
        );
    }

    res.json(new ApiResponse(200, message));
  }
}
