import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useBoardStore } from "@/store/board.store";
import { BoardCard, BoardColumn } from "@/types/board.types";

export function useBoardSocket(boardId: string) {
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
    // join the board room
    socket.emit("join:board", { boardId });

    // card events
    socket.on(
      "card:created",
      ({ card, columnId }: { card: BoardCard; columnId: string }) => {
        addCard(columnId, card);
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
      }: {
        cardId: string;
        fromColumnId: string;
        toColumnId: string;
        newIndex: number;
      }) => {
        moveCard(cardId, fromColumnId, toColumnId, newIndex);
      },
    );

    socket.on(
      "card:deleted",
      ({ cardId, columnId }: { cardId: string; columnId: string }) => {
        deleteCard(cardId, columnId);
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
