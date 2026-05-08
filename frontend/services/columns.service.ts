import { api } from "@/lib/api";
import { BoardColumn } from "@/types/board.types";

export const ColumnService = {
  create: async (boardId: string, data: CreateCol): Promise<BoardColumn> => {
    return api.post(`/boards/${boardId}/columns`, data);
  },

  updateOrder: async (columnId: string, order: number) => {
    return api.patch(`/columns/${columnId}/order`, { order });
  },

  update: async (columnId: string, data: ColUpdate) => {
    return api.patch(`/columns/${columnId}`, data);
  },
};

export interface ColumnType {
  id: string;
  name: string;
  order: number;
  mappedStatus: string;
  cards: [];
}

export interface CreateCol {
  name: string;
  mappedStatus: string;
}
export interface ColUpdate {
  name?: string;
  mappedStatus?: string;
}
