import { api } from "@/lib/api";

export const ColumnService = {
  create: async (boardId: string, data: CreateCol): Promise<ColumnType> => {
    return api.post(`/boards/${boardId}/columns`, data);
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

export interface CreateCol {
  name: string;
  mappedStatus: string;
}
