import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

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
  sendInvitationSchema,
} from '../validations/workspaces.validation';

const router = Router();

router.use(authenticate);
router.post(
  '/',
  validateInput(createWorkspaceSchema),
  asyncHandler(WorkspaceController.createWorkspace)
);

router.get(
  '/',
  // requireAdmin,
  asyncHandler(WorkspaceController.getAllWorkspaces)
);

router.get(
  '/:workspaceId',
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(WorkspaceController.getWorkspace)
);

router.patch(
  '/:workspaceId',
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['admin', 'owner']),
  asyncHandler(WorkspaceController.updateWorkspace)
);

router.delete(
  '/:workspaceId',
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['owner']),
  asyncHandler(WorkspaceController.deleteWorkspace)
);

// Membership
router.get(
  '/:workspaceId/members',
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(WorkspaceController.getMembers)
);

router.delete(
  '/:workspaceId/members/:userId',
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['owner', 'admin']),
  asyncHandler(WorkspaceController.removeMember)
);

// Invitations
router.post(
  '/:workspaceId/invitations',
  validateUrlParams(paramsSchema),
  validateInput(sendInvitationSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['owner', 'admin']),
  asyncHandler(WorkspaceController.sendInvitation)
);

export default router;
