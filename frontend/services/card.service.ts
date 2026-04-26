import { api } from "@/lib/api";

export const CardService = {
  moveCard: async (cardId: string, columnId: string, order: number) => {
    return api.patch(`/cards/${cardId}/move`, { columnId, order });
  },
};
