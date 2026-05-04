import { CardService } from "@/services/card.service";
import { WorkspaceMembers } from "@/services/workspace.service";
import { useBoardStore } from "@/store/board.store";
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
      await queryClient.cancelQueries({ queryKey: ["card", cardId] });

      const store = useBoardStore.getState();

      if (isAssigned) {
        store.removeUserFromCard(cardId, member.userId);
      } else {
        if (member) store.assignUserToCard(cardId, member);
      }

      return { previousIsAttached: isAssigned, member };
    },

    // 2. If the API fails, roll back to the previous snapshot
    onError: (err, variables, context) => {
      const store = useBoardStore.getState();
      if (context) {
        if (context.previousIsAttached) {
          store.assignUserToCard(cardId, context.member);
        } else {
          store.removeUserFromCard(cardId, context.member.userId);
        }
      }
      toast.error("Failed to update assignee");
    },

    // 3. Always refetch after error or success to ensure perfect server sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["card", cardId] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });
}
