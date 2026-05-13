import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

import { WorkspaceController } from '../controllers/workspaces.controller';
import {
  validateInput,
  validateUrlParams,
} from '../middleware/validation.middleware';
import {
  requireWorkspaceMember,
  requireWorkspaceRole,
} from '../middleware/workspace.middleware';
import { asyncHandler } from '../utils/async-handler';
import { paramsSchema } from '../validations/urlParams.validation';
import {
  createWorkspaceSchema,
  resendInvitationSchema,
  sendInvitationSchema,
  updateMemberRoleSchema,
  updateWorkspaceSchema,
} from '../validations/workspaces.validation';

const router = Router();

router.post(
  '/',
  authenticate,
  validateInput(createWorkspaceSchema),
  asyncHandler(WorkspaceController.createWorkspace)
);

router.get(
  '/',
  authenticate,
  asyncHandler(WorkspaceController.getAllWorkspaces)
);

router.get(
  '/:workspaceId',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(WorkspaceController.getWorkspace)
);

router.patch(
  '/:workspaceSlug',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(updateWorkspaceSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner', 'Admin']),
  asyncHandler(WorkspaceController.updateWorkspace)
);

router.delete(
  '/:workspaceSlug',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner']),
  asyncHandler(WorkspaceController.deleteWorkspace)
);

// Membership
router.get(
  '/:workspaceSlug/members',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(WorkspaceController.getMembers)
);

router.patch(
  '/:workspaceSlug/members/:userId',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(updateMemberRoleSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner', 'Admin']),
  asyncHandler(WorkspaceController.updateMemberRole)
);

router.delete(
  '/:workspaceSlug/members/:userId',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner', 'Admin']),
  asyncHandler(WorkspaceController.removeMember)
);

// Invitations
router.post(
  '/:workspaceSlug/invitations',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(sendInvitationSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner', 'Admin']),
  asyncHandler(WorkspaceController.sendInvitation)
);

router.get(
  '/:workspaceSlug/invitations/pending',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner', 'Admin']),
  asyncHandler(WorkspaceController.getPendingInvites)
);

router.delete(
  '/:workspaceSlug/invitations/:email',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner', 'Admin']),
  asyncHandler(WorkspaceController.revokeInvite)
);

router.post(
  '/:workspaceSlug/invitations/resend',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(resendInvitationSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner', 'Admin']),
  asyncHandler(WorkspaceController.resendInvitation)
);

export default router;
