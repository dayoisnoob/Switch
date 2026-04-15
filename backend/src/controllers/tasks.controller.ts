import type { Request, Response } from 'express';
import { TasksService } from '../services/tasks.service';
import { ApiResponse } from '../utils/api-response';

export class TasksController {
  static async createTask(req: Request, res: Response) {
    const userId = req.user!.id;

    const task = await TasksService.createTask(userId, req.body);

    res
      .status(201)
      .json(new ApiResponse(201, 'Task successfully created', task));
  }

  static async moveTask(req: Request, res: Response) {
    const userId = req.user!.id;
    const { taskId } = req.params;
    const { columnId, order } = req.body;

    const task = await TasksService.moveTask(
      userId,
      taskId as string,
      columnId,
      order
    );

    res.json(new ApiResponse(200, 'Task successfully cremovedated', task));
  }
}
