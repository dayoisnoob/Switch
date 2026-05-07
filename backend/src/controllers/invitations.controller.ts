import type { Request, Response } from 'express';
import { InvitationsService } from '../services/invitations.service';
import { ApiResponse } from '../utils/api-response';
import type { AuthenticatedRequest } from '../types/express';

export class InvitationsController {
  static async verifyInvitation(req: AuthenticatedRequest, res: Response) {
    const invitationtoken = req.params.token as string;

    const result = await InvitationsService.verifyInvitation(invitationtoken);

    res.json(new ApiResponse(200, 'Invitation verified successfully', result));
  }

  static async acceptInvitation(req: AuthenticatedRequest, res: Response) {
    const email = req.user?.email ?? null;

    const invitationtoken = req.params.token as string;

    const { requiresRegistration, token, message, workspaceSlug } =
      await InvitationsService.acceptInvitation(email, invitationtoken);

    if (requiresRegistration) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            'Please signup on Switch to accept this invitation.',
            { requiresRegistration: true, token }
          )
        );
    }

    res.json(new ApiResponse(200, message, workspaceSlug));
  }
}
