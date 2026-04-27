import { CardService } from "@/services/card.service";
import { WorkspaceMembers } from "@/services/workspace.service";
import { useBoardStore } from "@/store/board.store";
import { BoardCard } from "@/types/board.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useToggleAssignee(card: BoardCard) {
  const queryClient = useQueryClient();

  const assignUser = useBoardStore((s) => s.assignUserToCard);
  const removeUser = useBoardStore((s) => s.removeUserFromCard);

  return useMutation({
    mutationFn: async ({
      member,
      isAssigned,
    }: {
      member: WorkspaceMembers;
      isAssigned: boolean;
    }) => {
      if (isAssigned) {
        return await CardService.removeUser(card.id, member.userId);
      } else {
        return await CardService.assignUser(card.id, member.userId);
      }
    },

    onMutate: async ({ member, isAssigned }) => {
      await queryClient.cancelQueries({ queryKey: ["card", card.id] });

      const previousCard = queryClient.getQueryData<BoardCard>([
        "card",
        card.id,
      ]);

      if (isAssigned) {
        removeUser(card.id, member.userId);
      } else {
        assignUser(card.id, {
          id: member.id,
          userId: member.userId,
          firstName: member.firstName,
          lastName: member.lastName,
          avatarUrl: member.avatarUrl,
        });
      }

      return { previousCard };
    },

    onError: (err, variables, context) => {
      if (context?.previousCard) {
        queryClient.setQueryData(["card", card.id], context.previousCard);

        if (variables.isAssigned) {
          assignUser(card.id, {
            id: variables.member.id,
            userId: variables.member.userId,
            firstName: variables.member.firstName,
            lastName: variables.member.lastName,
            avatarUrl: variables.member.avatarUrl,
          });
        } else {
          removeUser(card.id, variables.member.userId);
        }
      }
      toast.error("Failed to update assignee");
      console.error(err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["card", card.id] });
      queryClient.invalidateQueries({ queryKey: ["members", card.id] });
    },
  });
}
