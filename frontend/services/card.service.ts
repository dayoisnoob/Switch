import { api } from "@/lib/api";
import { BoardAssignee, BoardCard, BoardLabel } from "@/types/board.types";

export const CardService = {
  create: async (columnId: string, data: CreateCard): Promise<BoardCard> => {
    return api.post(`/columns/${columnId}/cards`, data);
  },

  moveCard: async (cardId: string, data: MoveCard) => {
    console.log(data);
    return api.patch(`/cards/${cardId}/move`, data);
  },

  update: async (cardId: string, data: CardUpdateType) => {
    return api.patch(`/cards/${cardId}`, data);
  },

  assignUser: async (cardId: string, userId: string) => {
    return api.post(`/cards/${cardId}/assignees`, { userId });
  },

  removeUser: async (cardId: string, userId: string) => {
    return api.delete(`/cards/${cardId}/assignees/${userId}`);
  },

  deleteCard: async (cardId: string) => {
    return api.delete(`/cards/${cardId}`);
  },

  getOpenCardsCount: async (): Promise<{ count: number }> => {
    return api.get(`/cards/open/count`);
  },

  getCardById: async (cardId: string): Promise<CardType> => {
    return api.get(`/cards/${cardId}`);
  },
};

export interface CardUpdateType {
  title?: string;
  description?: string;
  priority?: CardPriority;
  dueDate?: Date;
}
export interface CreateCard {
  title: string;
  description?: string;
  status: StatusType;
  priority?: CardPriority;
  dueDate?: Date;
  assignees?: string[];
}

export interface MoveCard {
  columnId: string;
  order: number;
  status: string;
}

export type StatusType =
  | "BACKLOG"
  | "TODO"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELED";

export type CardPriority = "none" | "low" | "medium" | "high" | "urgent";

export interface CardType {
  id: string;
  title: string;
  description: string;
  priority: "none" | "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  coverImageUrl: string | null;
  order: number;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  updatedAt: string;
  createdAt: string;
  assignees: BoardAssignee[];
  labels: BoardLabel[];
}
