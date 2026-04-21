import type { Response } from 'express';
import { CardsService } from '../services/cards.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../utils/api-response';
import { getParam } from '../utils/params.util';

export class CardsController {
  static async createCard(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const boardId = req.resolvedColumn?.boardId!;
    const workspaceId = req.workspace?.workspaceId!;
    const columnId = getParam(req.params.columnId, 'columnId');

    const card = await CardsService.createCard(
      userId,
      workspaceId,
      columnId,
      boardId,
      req.body
    );

    res
      .status(201)
      .json(new ApiResponse(201, 'Card created successfully', card));
  }

  static async getCard(req: AuthenticatedRequest, res: Response) {
    const cardId = getParam(req.params.cardId, 'cardId');
    const card = await CardsService.getCard(cardId);

    res.json(new ApiResponse(200, 'Card retrieved successfully', card));
  }

  static async updateCard(req: AuthenticatedRequest, res: Response) {
    const cardId = getParam(req.params.cardId, 'cardId');
    const card = await CardsService.updateCard(cardId, req.body);

    res.json(new ApiResponse(200, 'Card updated successfully', card));
  }

  static async deleteCard(req: AuthenticatedRequest, res: Response) {
    const cardId = getParam(req.params.cardId, 'cardId');
    const card = await CardsService.deleteCard(cardId);

    res.json(new ApiResponse(200, 'Card deleted successfully', card));
  }

  static async moveCard(req: AuthenticatedRequest, res: Response) {
    const cardId = getParam(req.params.cardId, 'cardId');
    const card = await CardsService.moveCard(cardId, req.body);

    res.json(new ApiResponse(200, 'Card moved successfully', card));
  }

  static async assignUser(req: AuthenticatedRequest, res: Response) {
    const cardId = getParam(req.params.cardId, 'cardId');

    const user = await CardsService.assignUser(cardId, req.body.userId);

    res.json(new ApiResponse(200, 'User assigned successfully', user));
  }

  static async unassignUser(req: AuthenticatedRequest, res: Response) {
    const cardId = getParam(req.params.cardId, 'cardId');
    const userId = getParam(req.params.userId, 'userId');

    const user = await CardsService.unassignUser(cardId, userId);

    res.json(new ApiResponse(200, 'User removed successfully', user));
  }

  static async attachLabel(req: AuthenticatedRequest, res: Response) {
    const cardId = getParam(req.params.cardId, 'cardId');

    const label = await CardsService.attachLabel(cardId, req.body.labelId);

    res.json(new ApiResponse(200, 'Label attached successfully', label));
  }

  static async detatchLabel(req: AuthenticatedRequest, res: Response) {
    const cardId = getParam(req.params.cardId, 'cardId');
    const labelId = getParam(req.params.labelId, 'labelId');

    const label = await CardsService.detatchLabel(cardId, labelId);

    res.json(new ApiResponse(200, 'Label removed successfully', label));
  }
}
