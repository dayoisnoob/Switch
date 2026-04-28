import { api } from "@/lib/api";

export const LabelService = {
  create: async (cardId: string, content: string): Promise<CardComment> => {
    return api.post(`/cards/${cardId}/comments`, { content });
  },
};

export interface CardComment {
  id: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}
