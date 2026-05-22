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
import { paramsSchema } from '../validations/urlParams.validation';
import {
  createProjectSchema,
  updateProjectSchema,
} from '../validations/projects.validation';

const router = Router({ mergeParams: true });

router.post(
  '/',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(createProjectSchema),
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
  '/:projectSlug',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(ProjectController.getProject)
);

router.patch(
  '/:projectSlug',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(updateProjectSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner', 'Admin']),
  asyncHandler(ProjectController.updateProject)
);

router.delete(
  '/:projectSlug',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner']),
  asyncHandler(ProjectController.deleteProject)
);

export default router;
