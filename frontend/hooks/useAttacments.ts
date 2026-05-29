import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { useBoardStore } from "@/store/board.store";
import { CardAttachment } from "@/types/board.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UploadSignature {
  signature: string;
  timestamp: number;
  folder: string;
  cloudName: string;
  apiKey: string;
}

export function useUploadAttachment(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<CardAttachment> => {
      const sig = (await api.get(
        `/cards/${cardId}/attachments/signature`,
      )) as unknown as UploadSignature;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", sig.signature);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("folder", sig.folder);
      formData.append("api_key", sig.apiKey);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
        { method: "POST", body: formData },
      );
      const uploaded = await cloudinaryRes.json();

      return api.post(`/cards/${cardId}/attachments`, {
        fileUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        fileName: file.name,
        fileSize: uploaded.bytes,
        mimeType: file.type,
        resourceType: uploaded.resource_type,
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
