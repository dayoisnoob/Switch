import { api } from "@/lib/api";

export const CommentService = {
  create: async (cardId: string, content: string): Promise<CardComment> => {
    return api.post(`/cards/${cardId}/comments`, { content });
  },

  getByCardId: async (cardId: string): Promise<CardComment[]> => {
    return api.get(`/cards/${cardId}/comments`);
  },

  edit: async (commentId: string, content: string): Promise<CardComment> => {
    return api.patch(`/comments/${commentId}`, { content });
  },

  deleteById: async (commentId: string) => {
    return api.delete(`/comments/${commentId}`);
  },
};

export interface CardComment {
  id: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}
