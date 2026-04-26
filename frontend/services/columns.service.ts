import { api } from "@/lib/api";

export const ColumnService = {
  createColumn: async (boardId: string, name: string): Promise<ColumnType> => {
    return api.patch(`/boards/${boardId}/columns`, { name });
  },

  updateColumnOrder: async (
    columnId: string,
    order: number,
  ): Promise<ColumnType> => {
    return api.patch(`/columns/${columnId}/order`, { order });
  },
};

export interface ColumnType {
  id: string;
  name: string;
  order: number;
}
