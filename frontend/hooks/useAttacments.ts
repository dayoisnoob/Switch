import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUploadAttachment(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // 1. Pack the file into FormData
      const formData = new FormData();
      formData.append("file", file);

      // 2. Send to your express endpoint
      const { data } = await api.post(
        `/cards/${cardId}/attachments`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast.success("Attachment uploaded successfully");
    },
    onError: () => {
      toast.error("Failed to upload attachment");
    },
  });
}

export function useDeleteAttachment(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      await api.delete(`/cards/${cardId}/attachments/${attachmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      toast.success("Attachment deleted");
    },
  });
}
