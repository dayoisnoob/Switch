import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useBoardStore } from "@/store/board.store";
import { BoardCard, BoardColumn } from "@/types/board.types";
import { useMe } from "./useAuth";
import { toast } from "sonner";
import { CardUpdateType } from "@/services/card.service";

interface CardCreated {
  card: BoardCard;
  columnId: string;
  actorId: string;
  actorName: string;
  cardTitle: string;
}

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
      ({ card, columnId, actorId, actorName, cardTitle }: CardCreated) => {
        addCard(columnId, card);
        if (actorId !== currentUser?.id) {
          toast.success(
            `${actorName || "Someone"} created a new card - ${cardTitle}`,
          );
        }
      },
    );

    socket.on(
      "card:updated",
      ({
        cardId,
        changes,
        actorId,
        actorName,
        cardTitle,
      }: {
        cardId: string;
        changes: Partial<BoardCard>;
        actorId: string;
        actorName: string;
        cardTitle: string;
      }) => {
        updateCard(cardId, changes);
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
    socket.on(
      "column:created",
      ({
        column,
        actorName,
        actorId,
      }: {
        column: BoardColumn;
        actorName: string;
        actorId: string;
      }) => {
        addColumn(column);
        if (actorId !== currentUser?.id) {
          toast.success(
            `${actorName || "Someone"} deleted a new column - ${column.name}`,
          );
        }
      },
    );

    socket.on(
      "column:updated",
      ({
        columnId,
        colName,
        actorName,
        actorId,
      }: {
        columnId: string;
        colName: string;
        actorName: string;
        actorId: string;
      }) => {
        updateColumn(columnId, colName);
        if (actorId !== currentUser?.id) {
          toast.success(
            `${actorName || "Someone"} updated a colun to ${colName}`,
          );
        }
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
