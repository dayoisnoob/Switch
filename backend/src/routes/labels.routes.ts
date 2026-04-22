import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

import { LabelController } from '../controllers/labels.controller';
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
  createLabelSchema,
  updateLabelSchema,
} from '../validations/labels.validation';
import { paramsSchema } from '../validations/urlParams.validation';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/',
  validateUrlParams(paramsSchema),
  validateInput(createLabelSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['owner', 'admin']),
  asyncHandler(LabelController.createLabel)
);

router.get(
  '/',
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(LabelController.listLabels)
);

router.patch(
  '/:labelId',
  validateUrlParams(paramsSchema),
  validateInput(updateLabelSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['owner', 'admin']),
  asyncHandler(LabelController.updateLabel)
);

router.delete(
  '/:labelId',
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  requireWorkspaceRole(['owner', 'admin']),
  asyncHandler(LabelController.deleteLabel)
);

export default router;
