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
} from '../validations/projects.validation';
import { paramsSchema } from '../validations/urlParams.validation';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/',
  validateUrlParams(paramsSchema),
  validateInput(createColumnSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['owner', 'admin']),
  asyncHandler(ColumnsController.createColumn)
);

router.patch(
  '/:columnId/',
  validateUrlParams(paramsSchema),
  validateInput(createColumnSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['owner', 'admin']),
  asyncHandler(ColumnsController.updateColumnName)
);

router.patch(
  '/:columnId/order',
  validateUrlParams(paramsSchema),
  validateInput(columnOrderSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['owner', 'admin']),
  asyncHandler(ColumnsController.updateColumnOrder)
);

router.delete(
  '/:columnId',
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['owner', 'admin']),
  asyncHandler(ColumnsController.deleteColumn)
);

export default router;
