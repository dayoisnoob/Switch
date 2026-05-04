import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

import { ColumnsController } from '../controllers/columns.controller';
import {
  validateInput,
  validateUrlParams,
} from '../middleware/validation.middleware';
import {
  requireWorkspaceMember,
  requireWorkspaceRole,
} from '../middleware/workspace.middleware';
import { asyncHandler } from '../utils/async-handler';
import {
  columnOrderSchema,
  createColumnSchema,
  updateColumnSchema,
} from '../validations/projects.validation';
import { paramsSchema } from '../validations/urlParams.validation';

const router = Router({ mergeParams: true });

router.post(
  '/',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(createColumnSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner', 'Admin']),
  asyncHandler(ColumnsController.createColumn)
);

router.patch(
  '/:columnId/',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(updateColumnSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner', 'Admin']),
  asyncHandler(ColumnsController.updateColumnName)
);

router.patch(
  '/:columnId/order',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(columnOrderSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner', 'Admin']),
  asyncHandler(ColumnsController.updateColumnOrder)
);

router.delete(
  '/:columnId',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner', 'Admin']),
  asyncHandler(ColumnsController.deleteColumn)
);

export default router;
