import { CardService } from "@/services/card.service";
import { WorkspaceMembers } from "@/services/workspace.service";
import { BoardAssignee, BoardCard } from "@/types/board.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useToggleAssignee(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      member,
      isAssigned,
    }: {
      member: WorkspaceMembers;
      isAssigned: boolean;
    }) => {
      if (isAssigned) {
        return await CardService.removeUser(cardId, member.userId);
      } else {
        return await CardService.assignUser(cardId, member.userId);
      }
    },

    // 1. Fire instantly on click
    onMutate: async ({ member, isAssigned }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["card", cardId] });

      // Snapshot the previous value in case we need to roll back
      const previousCard = queryClient.getQueryData(["card", cardId]);

      // Optimistically update the cache instantly
      queryClient.setQueryData(["card", cardId], (old: BoardCard) => {
        if (!old) return old;

        const newAssignees = isAssigned
          ? // If they were assigned, optimistically remove them
            old.assignees.filter((a: BoardAssignee) => a.id !== member.userId)
          : // If they weren't, optimistically add them (mapping member fields to match your assignee schema)
            [
              ...old.assignees,
              {
                id: member.userId,
                firstName: member.firstName,
                lastName: member.lastName,
                avatarUrl: member.avatarUrl,
              },
            ];

        return { ...old, assignees: newAssignees };
      });

      // Return context with the snapshotted value
      return { previousCard };
    },

    // 2. If the API fails, roll back to the previous snapshot
    onError: (err, newTodo, context) => {
      toast.error("Failed to update assignee");
      if (context?.previousCard) {
        queryClient.setQueryData(["card", cardId], context.previousCard);
      }
    },

    // 3. Always refetch after error or success to ensure perfect server sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });
}
