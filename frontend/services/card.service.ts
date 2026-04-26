import { api } from "@/lib/api";
import { BoardCard } from "@/types/board.types";

export const CardService = {
  create: async (columnId: string, title: string): Promise<BoardCard> => {
    return api.post(`/columns/${columnId}/cards`, { title });
  },

  moveCard: async (cardId: string, columnId: string, order: number) => {
    return api.patch(`/cards/${cardId}/move`, { columnId, order });
  },
};
