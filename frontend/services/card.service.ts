import { api } from "@/lib/api";
import { BoardCard } from "@/types/board.types";

export const CardService = {
  create: async (columnId: string, title: string): Promise<BoardCard> => {
    return api.post(`/columns/${columnId}/cards`, { title });
  },

  moveCard: async (cardId: string, columnId: string, order: number) => {
    return api.patch(`/cards/${cardId}/move`, { columnId, order });
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
};

export interface CardUpdateType {
  title?: string;
  description?: string;
  priority?: "none" | "low" | "medium" | "high" | "urgent";
  dueDate?: Date;
}
