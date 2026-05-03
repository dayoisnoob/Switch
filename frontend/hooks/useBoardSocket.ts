import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useBoardStore } from "@/store/board.store";
import { BoardCard, BoardColumn } from "@/types/board.types";
import { useMe } from "./useAuth";
import { toast } from "sonner";

export function useBoardSocket(boardId: string) {
  const { data: currentUser } = useMe();
  const {
    addCard,
    updateCard,
    moveCard,
    deleteCard,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    setPresence,
  } = useBoardStore();

  useEffect(() => {
    socket.emit("join:board", { boardId });

    socket.on(
      "card:created",
      ({ card, columnId, actorId, actorName, cardTitle }: any) => {
        addCard(columnId, card);
        if (actorId !== currentUser?.id) {
          toast.success(
            `${actorName || "Someone"} created a new card - ${cardTitle}`,
          );
        }
      },
    );

    socket.on("card:updated", ({ card }: { card: BoardCard }) => {
      updateCard(card);
    });

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
      }: {
        cardId: string;
        fromColumnId: string;
        toColumnId: string;
        newIndex: number;
        actorId: string;
        actorName: string;
        fromColumnName: string;
        toColumnName: string;
      }) => {
        moveCard(cardId, fromColumnId, toColumnId, newIndex);
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
      ({
        cardId,
        actorName,
        actorId,
        columnId,
        cardTitle,
      }: {
        cardId: string;
        actorName: string;
        actorId: string;
        columnId: string;
        cardTitle: string;
      }) => {
        deleteCard(cardId, columnId);
        if (actorId !== currentUser?.id) {
          toast.success(
            `${actorName || "Someone"} deleted a the ${cardTitle} card`,
          );
        }
      },
    );

    // column events
    socket.on("column:created", ({ column }: { column: BoardColumn }) => {
      addColumn(column);
    });

    socket.on(
      "column:updated",
      ({ columnId, name }: { columnId: string; name: string }) => {
        updateColumn(columnId, name);
      },
    );

    socket.on("column:deleted", ({ columnId }: { columnId: string }) => {
      deleteColumn(columnId);
    });

    socket.on("column:reordered", ({ columns }: { columns: BoardColumn[] }) => {
      reorderColumns(columns);
    });

    // presence
    socket.on("board:presence", ({ users }) => {
      setPresence(users);
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
      socket.off("board:presence");
    };
  }, [
    addCard,
    addColumn,
    boardId,
    deleteCard,
    deleteColumn,
    moveCard,
    reorderColumns,
    setPresence,
    updateCard,
    updateColumn,
  ]);
}
