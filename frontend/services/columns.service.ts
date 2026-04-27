import { api } from "@/lib/api";

export const ColumnService = {
  create: async (boardId: string, name: string): Promise<ColumnType> => {
    return api.post(`/boards/${boardId}/columns`, { name });
  },

  updateOrder: async (columnId: string, order: number) => {
    return api.patch(`/columns/${columnId}/order`, { order });
  },

  rename: async (columnId: string, name: string) => {
    return api.patch(`/columns/${columnId}`, { name });
  },

  delete: async (columnId: string) => {
    return api.delete(`/columns/${columnId}`);
  },
};

export interface ColumnType {
  id: string;
  name: string;
  order: number;
  cards: [];
}
