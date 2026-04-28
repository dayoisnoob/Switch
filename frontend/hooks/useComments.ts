import { CardComment, CommentService } from "@/services/comment.service";
import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateComment = (cardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) =>
      CommentService.create(cardId, content),

    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["comments", cardId] });
      const previousComments = queryClient.getQueryData<CardComment[]>([
        "comments",
        cardId,
      ]);

      const user = useAuthStore.getState().user;

      if (user) {
        const optimisticComment: CardComment = {
          id: `temp-${Date.now()}`,
          content,
          isEdited: false,
          createdAt: new Date().toISOString(),
          author: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
          },
        };

        queryClient.setQueryData<CardComment[]>(["comments", cardId], (old) => {
          return [optimisticComment, ...(old || [])];
        });
      }

      return { previousComments };
    },

    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(["card", cardId], context.previousComments);
      }
      toast.error("Failed to post comment");
      console.error(err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", cardId] });
    },
  });
};

export const useGetComments = (cardId: string) => {
  return useQuery({
    queryKey: ["comments", cardId],
    queryFn: () => CommentService.getByCardId(cardId),
  });
};

export const useEditComment = (cardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => CommentService.edit(commentId, content),

    onMutate: async ({ commentId, content }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", cardId] });
      const previousComments = queryClient.getQueryData<CardComment[]>([
        "comments",
        cardId,
      ]);

      if (previousComments) {
        queryClient.setQueryData<CardComment[]>(["comments", cardId], (old) => {
          if (!old) return old;

          return old.map((comment) =>
            comment.id === commentId
              ? { ...comment, content, isEdited: true }
              : comment,
          );
        });
      }

      return { previousComments };
    },

    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", cardId],
          context.previousComments,
        );
      }
      toast.error("Failed to edit comment");
      console.error(err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", cardId] });
    },
  });
};

export const useDeleteComment = (cardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) =>
      CommentService.deleteById(commentId),

    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ["comments", cardId] });
      const previousComments = queryClient.getQueryData<CardComment[]>([
        "comments",
        cardId,
      ]);

      if (previousComments) {
        queryClient.setQueryData<CardComment[]>(["comments", cardId], (old) => {
          if (!old) return old;

          return old.filter((comment) => comment.id !== commentId);
        });
      }

      return { previousComments };
    },

    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["comments", cardId],
          context.previousComments,
        );
      }
      toast.error("Failed to delete comment");
      console.error(err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", cardId] });
    },
  });
};
