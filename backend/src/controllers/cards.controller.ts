import type { Response } from 'express';
import { CardsService } from '../services/cards.service';
import type { AuthenticatedRequest } from '../types/express';
import { ApiResponse } from '../utils/api-response';

export class CardsController {
  static async createCard(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const boardId = req.resolvedColumn!.boardId;
    const projectId = req.resolvedColumn!.projectId;
    const workspaceId = req.workspace!.workspaceId;
    const columnId = req.params.columnId as string;

    const card = await CardsService.createCard(
      userId,
      workspaceId,
      columnId,
      boardId,
      projectId,
      req.body
    );

    res
      .status(201)
      .json(new ApiResponse(201, 'Card created successfully', card));
  }

  static async getCard(req: AuthenticatedRequest, res: Response) {
    const cardId = req.params.cardId as string;
    const card = await CardsService.getCard(cardId);

    res.json(new ApiResponse(200, 'Card retrieved successfully', card));
  }

  static async updateCard(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const projectId = req.resolvedCard!.projectId;
    const cardId = req.params.cardId as string;

    const card = await CardsService.updateCard(
      userId,
      projectId,
      cardId,
      req.body
    );

    res.json(new ApiResponse(200, 'Card updated successfully', card));
  }

  static async deleteCard(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const projectId = req.resolvedCard!.projectId;
    const cardId = req.params.cardId as string;
    const card = await CardsService.deleteCard(userId, projectId, cardId);

    res.json(new ApiResponse(200, 'Card deleted successfully', card));
  }

  static async moveCard(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const projectId = req.resolvedCard!.projectId;
    const cardId = req.params.cardId as string;
    const card = await CardsService.moveCard(
      userId,
      projectId,
      cardId,
      req.body
    );

    res.json(new ApiResponse(200, 'Card moved successfully', card));
  }

  static async assignUser(req: AuthenticatedRequest, res: Response) {
    const cardId = req.params.cardId as string;
    const projectId = req.resolvedCard!.projectId;

    const user = await CardsService.assignUser(
      projectId,
      cardId,
      req.body.userId
    );

    res.json(new ApiResponse(200, 'User assigned successfully', user));
  }

  static async unassignUser(req: AuthenticatedRequest, res: Response) {
    const cardId = req.params.cardId as string;
    const userId = req.params.userId as string;
    const projectId = req.resolvedCard!.projectId;

    const user = await CardsService.unassignUser(projectId, cardId, userId);

    res.json(new ApiResponse(200, 'User removed successfully', user));
  }

  static async attachLabel(req: AuthenticatedRequest, res: Response) {
    const userId = req.user.id;
    const cardId = req.params.cardId as string;
    const projectId = req.resolvedCard!.projectId;

    const label = await CardsService.attachLabel(
      userId,
      projectId,
      cardId,
      req.body.labelId
    );

    res.json(new ApiResponse(200, 'Label attached successfully', label));
  }

  static async detatchLabel(req: AuthenticatedRequest, res: Response) {
    const cardId = req.params.cardId as string;
    const labelId = req.params.labelId as string;

    const userId = req.user.id;
    const projectId = req.resolvedCard!.projectId;

    const label = await CardsService.detatchLabel(
      userId,
      projectId,
      cardId,
      labelId
    );

    res.json(new ApiResponse(200, 'Label removed successfully', label));
  }
}
