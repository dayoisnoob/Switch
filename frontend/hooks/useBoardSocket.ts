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

    socket.on(
      "card:created",
      ({ card, columnId, actorId, actorName, cardTitle }: CardCreated) => {
        useBoardStore.getState().addCard(columnId, card);
        if (actorId !== currentUser?.id) {
          toast.success(
            `${actorName || "Someone"} created a new card - ${cardTitle}`,
          );
        }
      },
    );

    socket.on(
      "card:updated",
      ({ cardId, changes, actorId, actorName, cardTitle }) => {
        useBoardStore.getState().updateCard(cardId, changes);
        if (actorId !== currentUser?.id) {
          toast.success(
            `${actorName || "Someone"} updated ${cardTitle ? `the card ${cardTitle}` : "a card"}`,
          );
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
          if (fromColumnId === toColumnId) {
            toast.info(
              `${actorName || "Someone"} reordered a card in ${fromColumnName}`,
            );
          } else {
            toast.info(
              `${actorName || "Someone"} moved a card from ${fromColumnName} to ${toColumnName}`,
            );
          }
        }
      },
    );

    socket.on(
      "card:deleted",
      ({ cardId, actorName, actorId, columnId, cardTitle }) => {
        useBoardStore.getState().deleteCard(cardId, columnId);
        if (actorId !== currentUser?.id) {
          toast.success(
            `${actorName || "Someone"} deleted the ${cardTitle} card`,
          );
        }
      },
    );

    // column events
    socket.on("column:created", ({ column, actorName, actorId }) => {
      useBoardStore.getState().addColumn(column);
      if (actorId !== currentUser?.id) {
        toast.success(
          `${actorName || "Someone"} created a new column - ${column.name}`,
        );
      }
    });

    socket.on("column:updated", ({ columnId, colName, actorName, actorId }) => {
      useBoardStore.getState().updateColumn(columnId, colName);
      if (actorId !== currentUser?.id) {
        toast.success(
          `${actorName || "Someone"} updated a column to ${colName}`,
        );
      }
    });

    socket.on("column:deleted", ({ columnId, actorName, actorId, colName }) => {
      useBoardStore.getState().deleteColumn(columnId);
      if (actorId !== currentUser?.id) {
        toast.success(
          `${actorName || "Someone"} deleted the column ${colName}`,
        );
      }
    });

    socket.on(
      "column:reordered",
      ({ colId, newOrder, actorId, actorName, colName }) => {
        useBoardStore.getState().moveColumn(colId, newOrder);
        if (actorId !== currentUser?.id) {
          toast.success(
            `${actorName || "Someone"} moved the column ${colName}`,
          );
        }
      },
    );

    // assignee events
    socket.on(
      "assignee:added",
      ({ cardId, assignee, actorId, actorName, cardTitle }) => {
        if (actorId !== currentUser?.id) {
          useBoardStore.getState().assignUserToCard(cardId, assignee);
          const assigneeName = `${assignee.firstName} ${assignee.lastName}`;
          toast.success(
            `${actorName || "Someone"} assigned ${assigneeName} to card ${cardTitle}`,
          );
        }
      },
    );

    socket.on(
      "assignee:removed",
      ({ cardId, assigneeId, assigneeName, actorId, actorName, cardTitle }) => {
        if (actorId !== currentUser?.id) {
          useBoardStore.getState().removeUserFromCard(cardId, assigneeId);
          toast.success(
            `${actorName || "Someone"} removed ${assigneeName} from card ${cardTitle}`,
          );
        }
      },
    );

    // label events
    socket.on(
      "label:attached",
      ({ cardId, label, actorId, actorName, cardTitle }) => {
        if (actorId !== currentUser?.id) {
          useBoardStore.getState().addLabelToCard(cardId, label);
          toast.success(
            `${actorName || "Someone"} added label:${label.name} to card ${cardTitle}`,
          );
        }
      },
    );

    socket.on(
      "label:removed",
      ({ cardId, label, actorId, actorName, cardTitle }) => {
        if (actorId !== currentUser?.id) {
          useBoardStore.getState().removeLabelFromCard(cardId, label.id);
          toast.success(
            `${actorName || "Someone"} removed label:${label.name} from card ${cardTitle}`,
          );
        }
      },
    );

    socket.on("label:created", ({ label, actorId, actorName }) => {
      useBoardStore.getState().addWorkspaceLabel(label);
      if (actorId !== currentUser?.id) {
        toast.success(
          `${actorName || "Someone"} added label:${label.name} to workspace`,
        );
      }
    });

    // Comment events
    socket.on(
      "comment:created",
      ({ cardId, actorId, actorName, cardTitle }) => {
        useBoardStore.getState().updateCommentCount(cardId, 1);

        queryClient.invalidateQueries({ queryKey: ["comments", cardId] });

        if (actorId !== currentUser?.id) {
          toast.info(`${actorName || "Someone"} commented on "${cardTitle}"`);
        }
      },
    );

    socket.on("comment:updated", (payload) => {
      queryClient.invalidateQueries({ queryKey: ["comments", payload.cardId] });

      if (payload.actorId !== currentUser?.id) {
        toast.info(
          `${payload.actorName || "Someone"} edited their comment on "${payload.cardTitle}"`,
        );
      }
    });

    socket.on("comment:deleted", (payload) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", payload.cardId],
      });

      if (payload.actorId !== currentUser?.id) {
        toast.info(
          `${payload.actorName || "Someone"} deleted their comment on the card "${payload.cardTitle}"`,
        );
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
      socket.off("assignee:added");
      socket.off("assignee:removed");
      socket.off("label:attached");
      socket.off("label:removed");
      socket.off("label:created");
      socket.off("comment:created");
      socket.off("comment:updated");
      socket.off("comment:deleted");
      socket.off("board:presence");
    };
  }, [boardId, currentUser?.id, queryClient]);
}
