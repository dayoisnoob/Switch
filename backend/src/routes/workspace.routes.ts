import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

import { WorkspaceController } from '../controllers/workspace.controller';
import { asyncHandler } from '../utils/async-handler';
import { validateInput } from '../middleware/validation.middleware';
import {
  createWorkspaceSchema,
  sendInvitationSchema,
} from '../validations/workspace.validation';
import { createProjectSchema } from '../validations/project.validation';
import { ProjectController } from '../controllers/project.controller';
import { BoardController } from '../controllers/board.controller';
import {
  requireWorkspaceMember,
  requireWorkspaceRole,
} from '../middleware/workspace.middleware';

const router = Router();

router.use(authenticate);
router.post(
  '/',
  validateInput(createWorkspaceSchema),
  asyncHandler(WorkspaceController.createWorkspace)
);

router.get(
  '/:workspaceId',
  asyncHandler(requireWorkspaceMember),
  asyncHandler(WorkspaceController.getWorkspace)
);

router.get(
  '/',
  requireAdmin,
  asyncHandler(WorkspaceController.getAllWorkspaces)
);

router.patch(
  '/:workspaceId',
  asyncHandler(requireWorkspaceMember),
  asyncHandler(requireWorkspaceRole(['admin', 'owner'])),
  asyncHandler(WorkspaceController.updateWorkspace)
);

router.delete(
  '/:workspaceId',
  asyncHandler(requireWorkspaceMember),
  asyncHandler(requireWorkspaceRole(['owner'])),
  asyncHandler(WorkspaceController.deleteWorkspace)
);

// Membership
router.get(
  '/:workspaceId/members',
  asyncHandler(requireWorkspaceMember),
  asyncHandler(WorkspaceController.getMembers)
);

router.delete(
  '/:workspaceId/members/:memberId',
  asyncHandler(requireWorkspaceMember),
  asyncHandler(requireWorkspaceRole(['owner', 'admin'])),
  asyncHandler(WorkspaceController.removeMember)
);

// Invitations
router.post(
  '/:workspaceId/invitations',
  validateInput(sendInvitationSchema),
  asyncHandler(requireWorkspaceMember),
  asyncHandler(requireWorkspaceRole(['owner', 'admin'])),
  asyncHandler(WorkspaceController.sendInvitation)
);

router.post(
  '/:workspaceId/projects',
  validateInput(createProjectSchema),
  asyncHandler(ProjectController.createProject)
);

router.get(
  '/:workspaceId/projects',
  asyncHandler(ProjectController.getAllProjects)
);

router.get(
  '/:workspaceId/projects/:projectId/board',
  asyncHandler(BoardController.getBoardState)
);

export default router;
