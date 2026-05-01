import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

import { ProjectController } from '../controllers/projects.controller';
import {
  validateInput,
  validateUrlParams,
} from '../middleware/validation.middleware';
import {
  requireWorkspaceMember,
  requireWorkspaceRole,
} from '../middleware/workspace.middleware';
import { asyncHandler } from '../utils/async-handler';
import { projectInputSchema } from '../validations/projects.validation';
import { paramsSchema } from '../validations/urlParams.validation';

const router = Router({ mergeParams: true });

router.post(
  '/',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(projectInputSchema),
  requireWorkspaceMember,
  asyncHandler(ProjectController.createProject)
);

router.get(
  '/',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(ProjectController.getWorkspaceProjects)
);

router.get(
  '/count',
  authenticate,
  asyncHandler(ProjectController.getUserActiveProjectsCount)
);

router.get(
  '/:projectSlug',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(ProjectController.getProject)
);

router.patch(
  '/:projectId',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(projectInputSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner', 'Admin']),
  asyncHandler(ProjectController.updateProject)
);

router.delete(
  '/:projectId',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner']),
  asyncHandler(ProjectController.deleteProject)
);

export default router;
