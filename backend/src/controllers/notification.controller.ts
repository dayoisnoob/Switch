import type { Response } from 'express';
import { NotificationService } from '../services/notification.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../utils/api-response';

export class NotificationController {
  static async getNotifications(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const notifications = await NotificationService.getNotifications(userId);

    res.json(
      new ApiResponse(
        200,
        'Notifications successfully retrieved',
        notifications
      )
    );
  }

  static async markRead(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const notificationId = req.params.notificationId as string;
    const notification = await NotificationService.markRead(
      notificationId,
      userId
    );

    res.json(
      new ApiResponse(200, 'Notification marked as read.', notification)
    );
  }

  static async markAllRead(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    await NotificationService.markAllRead(userId);

    res.json(new ApiResponse(200, 'All notifications marked as read.'));
  }
}
