import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

import { CardsController } from '../controllers/cards.controller';
import {
  validateInput,
  validateUrlParams,
} from '../middleware/validation.middleware';
import { requireWorkspaceMember } from '../middleware/workspace.middleware';
import { asyncHandler } from '../utils/async-handler';
import {
  assignUserSchema,
  attachLabelSchema,
  createCardSchema,
  moveCardSchema,
  updateCardSchema,
} from '../validations/card.validation';
import { paramsSchema } from '../validations/urlParams.validation';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  validateUrlParams(paramsSchema),
  validateInput(createCardSchema),
  requireWorkspaceMember,
  asyncHandler(CardsController.createCard)
);

router.get(
  '/:cardId',
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(CardsController.getCard)
);

router.patch(
  '/:cardId',
  validateUrlParams(paramsSchema),
  validateInput(updateCardSchema),
  requireWorkspaceMember,
  asyncHandler(CardsController.updateCard)
);

router.delete(
  '/:cardId',
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(CardsController.deleteCard)
);

router.patch(
  '/:cardId/move',
  validateUrlParams(paramsSchema),
  validateInput(moveCardSchema),
  requireWorkspaceMember,
  asyncHandler(CardsController.moveCard)
);

router.post(
  '/:cardId/assignees',
  validateUrlParams(paramsSchema),
  validateInput(assignUserSchema),
  requireWorkspaceMember,
  asyncHandler(CardsController.assignUser)
);

router.delete(
  '/:cardId/assignees/:userId',
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(CardsController.unassignUser)
);

router.post(
  '/:cardId/labels',
  validateUrlParams(paramsSchema),
  validateInput(attachLabelSchema),
  requireWorkspaceMember,
  asyncHandler(CardsController.attachLabel)
);

router.delete(
  '/:cardId/labels/:labelId',
  validateUrlParams(paramsSchema),
  requireWorkspaceMember,
  asyncHandler(CardsController.detatchLabel)
);

export default router;
