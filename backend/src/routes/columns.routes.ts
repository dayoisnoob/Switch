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
  moveCardsSchema,
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
  '/:columnId/move-cards',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(moveCardsSchema),
  requireWorkspaceMember,
  asyncHandler(ColumnsController.moveAllCards)
);

router.delete(
  '/:columnId/cards',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['Owner', 'Admin']),
  asyncHandler(ColumnsController.deleteCards)
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

router.patch(
  '/:columnId',
  authenticate,
  validateUrlParams(paramsSchema),
  validateInput(updateColumnSchema),
  requireWorkspaceMember,
  asyncHandler(ColumnsController.updateColumnName)
);

router.get(
  '/:columnId',
  authenticate,
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(ColumnsController.getColumn)
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
