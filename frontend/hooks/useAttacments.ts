import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { useBoardStore } from "@/store/board.store";
import { CardAttachment } from "@/types/board.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUploadAttachment(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<CardAttachment> => {
      const formData = new FormData();
      formData.append("file", file);

      return api.post(`/cards/${cardId}/attachments`, formData, {
        // headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
    },
    onSuccess: (newAttachment) => {
      useBoardStore.getState().addAttachmentToCard(cardId, newAttachment);
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast.success("Attachment uploaded successfully");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to upload attachment");
    },
  });
}

export function useDeleteAttachment(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      await api.delete(`/attachments/${attachmentId}`);
    },
    onSuccess: (_, attachmentId) => {
      useBoardStore.getState().removeAttachmentFromCard(cardId, attachmentId);
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
      toast.success("Attachment deleted");
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
      toast.error("Failed to delete attachment");
    },
  });
}
