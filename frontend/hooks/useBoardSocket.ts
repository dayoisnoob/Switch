import { socket } from "@/lib/socket";
import { useBoardStore } from "@/store/board.store";
import { BoardCard } from "@/types/board.types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { useMe } from "./useAuth";

interface CardCreated {
  card: BoardCard;
  columnId: string;
  actorId: string;
  actorName: string;
  cardTitle: string;
}

export function useBoardSocket(boardId: string) {
  const { data: currentUser } = useMe();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!boardId) return;

    socket.emit("join:board", { boardId });

    // --- CARDS ---
    socket.on(
      "card:created",
      ({ card, columnId, actorId, actorName, cardTitle }: CardCreated) => {
        useBoardStore.getState().addCard(columnId, card);
        if (actorId !== currentUser?.id) {
          const actor = actorName || "A teammate";
          toast.success(`${actor} added a new card: "${cardTitle}"`);
        }
      },
    );

    socket.on(
      "card:updated",
      ({ cardId, changes, actorId, actorName, cardTitle }) => {
        useBoardStore.getState().updateCard(cardId, changes);
        if (actorId !== currentUser?.id) {
          const actor = actorName || "A teammate";
          toast.info(`${actor} updated the card "${cardTitle || "Untitled"}"`);
        }
      },
    );

    socket.on(
      "card:moved",
      ({
        cardId,
        fromColumnId,
        toColumnId,
        newIndex,
        actorId,
        actorName,
        fromColumnName,
        toColumnName,
      }) => {
        useBoardStore
          .getState()
          .moveCard(cardId, fromColumnId, toColumnId, newIndex);

        if (actorId !== currentUser?.id) {
          const actor = actorName || "A teammate";
          if (fromColumnId === toColumnId) {
            toast.info(`${actor} reordered cards in "${fromColumnName}"`);
          } else {
            toast.info(`${actor} moved a card to "${toColumnName}"`);
          }
        }
      },
    );

    socket.on(
      "card:deleted",
      ({ cardId, actorName, actorId, columnId, cardTitle }) => {
        useBoardStore.getState().deleteCard(cardId, columnId);
        if (actorId !== currentUser?.id) {
          const actor = actorName || "A teammate";
          toast.info(`${actor} deleted the card "${cardTitle}"`);
        }
      },
    );

    // --- COLUMNS ---
    socket.on("column:created", ({ column, actorName, actorId }) => {
      useBoardStore.getState().addColumn(column);
      if (actorId !== currentUser?.id) {
        const actor = actorName || "A teammate";
        toast.success(`${actor} created a new column: "${column.name}"`);
      }
    });

    socket.on("column:updated", ({ columnId, colName, actorName, actorId }) => {
      useBoardStore.getState().updateColumn(columnId, colName);
      if (actorId !== currentUser?.id) {
        const actor = actorName || "A teammate";
        toast.info(`${actor} renamed a column to "${colName}"`);
      }
    });

    socket.on("column:deleted", ({ columnId, actorName, actorId, colName }) => {
      useBoardStore.getState().deleteColumn(columnId);
      if (actorId !== currentUser?.id) {
        const actor = actorName || "A teammate";
        toast.info(`${actor} deleted the column "${colName}"`);
      }
    });

    socket.on(
      "column:reordered",
      ({ colId, newOrder, actorId, actorName, colName }) => {
        useBoardStore.getState().moveColumn(colId, newOrder);
        if (actorId !== currentUser?.id) {
          const actor = actorName || "A teammate";
          toast.info(`${actor} reordered the column "${colName}"`);
        }
      },
    );

    socket.on("cards:deleted", ({ columnId, actorName, actorId, colName }) => {
      useBoardStore.getState().deleteCards(columnId);
      if (actorId !== currentUser?.id) {
        const actor = actorName || "A teammate";
        toast.success(`${actor} deleted all cards in the "${colName}" column`);
      }
    });

    socket.on("cards:moved", (payload) => {
      useBoardStore
        .getState()
        .moveAllCards(payload.fromColumnId, payload.toColumnId);
      if (payload.actorId !== currentUser?.id) {
        const actor = payload.actorName || "A teammate";
        //TODO: pass column names
        toast.success(`${actor} moved all cards in the column`);
      }
    });

    // --- ASSIGNEES ---
    socket.on(
      "assignee:added",
      ({ cardId, assignee, actorId, actorName, cardTitle }) => {
        if (actorId !== currentUser?.id) {
          useBoardStore.getState().assignUserToCard(cardId, assignee);
          const actor = actorName || "A teammate";
          const assigneeName = `${assignee.firstName} ${assignee.lastName}`;
          toast.success(`${actor} assigned ${assigneeName} to "${cardTitle}"`);
        }
      },
    );

    socket.on(
      "assignee:removed",
      ({ cardId, assigneeId, assigneeName, actorId, actorName, cardTitle }) => {
        if (actorId !== currentUser?.id) {
          useBoardStore.getState().removeUserFromCard(cardId, assigneeId);
          const actor = actorName || "A teammate";
          toast.info(`${actor} removed ${assigneeName} from "${cardTitle}"`);
        }
      },
    );

    // --- LABELS ---
    socket.on(
      "label:attached",
      ({ cardId, label, actorId, actorName, cardTitle }) => {
        if (actorId !== currentUser?.id) {
          useBoardStore.getState().addLabelToCard(cardId, label);
          const actor = actorName || "A teammate";
          toast.info(
            `${actor} added the "${label.name}" label to "${cardTitle}"`,
          );
        }
      },
    );

    socket.on(
      "label:removed",
      ({ cardId, label, actorId, actorName, cardTitle }) => {
        if (actorId !== currentUser?.id) {
          useBoardStore.getState().removeLabelFromCard(cardId, label.id);
          const actor = actorName || "A teammate";
          toast.info(
            `${actor} removed the "${label.name}" label from "${cardTitle}"`,
          );
        }
      },
    );

    socket.on("label:created", (payload) => {
      useBoardStore.getState().addWorkspaceLabel(payload.label);
      if (payload.actorId !== currentUser?.id) {
        const actor = payload.actorName || "A teammate";
        toast.success(
          `${actor} created a new workspace label: "${payload.label.name}"`,
        );
      }
    });

    socket.on("label:deleted", (payload) => {
      if (payload.labelId) {
        useBoardStore.getState().deleteWorkspaceLabel(payload.labelId);
      }

      queryClient.invalidateQueries({ queryKey: ["labels"] });
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["board"] });

      if (payload.actorId !== currentUser?.id) {
        const actor = payload.actorName || "A teammate";
        toast.info(
          `${actor} deleted the workspace label "${payload.labelName}"`,
        );
      }
    });

    // --- COMMENTS ---
    socket.on(
      "comment:created",
      ({ cardId, actorId, actorName, cardTitle }) => {
        useBoardStore.getState().updateCommentCount(cardId, 1);
        queryClient.invalidateQueries({ queryKey: ["comments", cardId] });

        if (actorId !== currentUser?.id) {
          const actor = actorName || "A teammate";
          toast.info(`${actor} left a comment on "${cardTitle}"`);
        }
      },
    );

    socket.on("comment:updated", (payload) => {
      queryClient.invalidateQueries({ queryKey: ["comments", payload.cardId] });

      if (payload.actorId !== currentUser?.id) {
        const actor = payload.actorName || "A teammate";
        toast.info(`${actor} edited a comment on "${payload.cardTitle}"`);
      }
    });

    socket.on("comment:deleted", (payload) => {
      useBoardStore.getState().updateCommentCount(payload.cardId, -1);
      queryClient.invalidateQueries({
        queryKey: ["comments", payload.cardId],
      });

      if (payload.actorId !== currentUser?.id) {
        const actor = payload.actorName || "A teammate";
        toast.info(`${actor} deleted a comment on "${payload.cardTitle}"`);
      }
    });

    // --- COMMENTS ---
    socket.on("attachment:uploaded", (p) => {
      if (p.actorId !== currentUser?.id) {
        useBoardStore.getState().addAttachmentToCard(p.cardId, p.attachment);
        const actor = p.actorName || "A teammate";
        toast.info(`${actor} uploaded a file to "${p.cardTitle}"`);
      }
    });

    socket.on("attachment:deleted", (p) => {
      if (p.actorId !== currentUser?.id) {
        useBoardStore
          .getState()
          .removeAttachmentFromCard(p.cardId, p.attachmentId);
        const actor = p.actorName || "A teammate";
        toast.info(`${actor} deleted a file from "${p.cardTitle}"`);
      }
    });

    socket.on("board:presence", ({ users }) => {
      useBoardStore.getState().setPresence(users);
    });

    return () => {
      socket.emit("leave:board", { boardId });
      socket.off("card:created");
      socket.off("card:updated");
      socket.off("card:moved");
      socket.off("card:deleted");
      socket.off("column:created");
      socket.off("column:updated");
      socket.off("column:deleted");
      socket.off("column:reordered");
      socket.off("cards:deleted");
      socket.off("assignee:added");
      socket.off("assignee:removed");
      socket.off("label:attached");
      socket.off("label:removed");
      socket.off("label:created");
      socket.off("label:deleted");
      socket.off("comment:created");
      socket.off("comment:updated");
      socket.off("comment:deleted");
      socket.off("attachment:uploaded");
      socket.off("attachment:deleted");
      socket.off("board:presence");
    };
  }, [boardId, currentUser?.id, queryClient]);
}
