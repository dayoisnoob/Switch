import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

import { WorkspaceController } from '../controllers/workspace.controller';
import { asyncHandler } from '../utils/async-handler';
import { validateInput } from '../middleware/validation.middleware';
import { createWorkspaceSchema } from '../validations/workspace.validation';
import { createProjectSchema } from '../validations/project.validation';
import { ProjectController } from '../controllers/project.controller';
import { BoardController } from '../controllers/board.controller';

const router = Router();

router.use(authenticate);
router.post(
  '/',
  validateInput(createWorkspaceSchema),
  asyncHandler(WorkspaceController.createWorkspace)
);

router.get('/', asyncHandler(WorkspaceController.getAllWorkspaces));

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
  '/:workspaceId/boards/:boardId',
  asyncHandler(BoardController.getBoardState)
);

export default router;
