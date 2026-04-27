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
};

export interface CardUpdateType {
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: Date;
}
