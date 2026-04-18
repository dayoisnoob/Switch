import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

import { TasksController } from '../controllers/tasks.controller';
import { validateInput } from '../middleware/validation.middleware';
import { asyncHandler } from '../utils/async-handler';
import {
  createTaskSchema,
  updateTaskPositionSchema,
} from '../validations/task.validation';

const router = Router();

router.use(authenticate);
router.post(
  '/',
  validateInput(createTaskSchema),
  asyncHandler(TasksController.createTask)
);

router.patch(
  '/:taskId/position',
  validateInput(updateTaskPositionSchema),
  asyncHandler(TasksController.moveTask)
);

export default router;
