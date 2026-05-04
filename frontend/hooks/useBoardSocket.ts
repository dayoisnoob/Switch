import { socket } from "@/lib/socket";
import { useBoardStore } from "@/store/board.store";
import { BoardAssignee, BoardCard, BoardColumn } from "@/types/board.types";
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
  const {
    addCard,
    updateCard,
    moveCard,
    deleteCard,
    addColumn,
    updateColumn,
    moveColumn,
    deleteColumn,
    assignUserToCard,
    removeUserFromCard,
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
            `${actorName || "Someone"} deleted the ${cardTitle} card`,
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
            `${actorName || "Someone"} created a new column - ${column.name}`,
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
            `${actorName || "Someone"} updated a column to ${colName}`,
          );
        }
      },
    );

    socket.on(
      "column:deleted",
      ({
        columnId,
        actorName,
        actorId,
        colName,
      }: {
        columnId: string;
        actorName: string;
        actorId: string;
        colName: string;
      }) => {
        deleteColumn(columnId);
        if (actorId !== currentUser?.id) {
          toast.success(
            `${actorName || "Someone"} deleted the column ${colName}`,
          );
        }
      },
    );

    socket.on(
      "column:reordered",
      ({
        colId,
        newOrder,
        actorId,
        actorName,
        colName,
      }: {
        actorId: string;
        actorName: string;
        colName: string;
        colId: string;
        newOrder: number;
      }) => {
        moveColumn(colId, newOrder);
        if (actorId !== currentUser?.id) {
          toast.success(
            `${actorName || "Someone"} moved the column ${colName}`,
          );
        }
      },
    );

    //assignee events
    socket.on(
      "assignee:added",
      ({
        cardId,
        assignee,
        actorId,
        actorName,
        cardTitle,
      }: {
        cardId: string;
        assignee: Partial<BoardAssignee>;
        actorId: string;
        actorName: string;
        cardTitle: string;
      }) => {
        assignUserToCard(cardId, assignee);
        if (actorId !== currentUser?.id) {
          const assigneeName = `${assignee.firstName} ${assignee.lastName}`;
          console.log("Assigned:", assigneeName);
          toast.success(
            `${actorName || "Someone"} assigned ${assigneeName} to card ${cardTitle}`,
          );
        }
      },
    );

    socket.on(
      "assignee:removed",
      ({
        cardId,
        assigneeId,
        assigneeName,
        actorId,
        actorName,
        cardTitle,
      }: {
        cardId: string;
        assigneeId: string;
        assigneeName: string;
        actorId: string;
        actorName: string;
        cardTitle: string;
      }) => {
        removeUserFromCard(cardId, assigneeId);
        if (actorId !== currentUser?.id) {
          console.log("Assigned:", assigneeName);
          toast.success(
            `${actorName || "Someone"} removed ${assigneeName} from card ${cardTitle}`,
          );
        }
      },
    );

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
      socket.off("assignee:added");
      socket.off("assignee:removed");
      socket.off("board:presence");
    };
  }, [
    addCard,
    addColumn,
    assignUserToCard,
    boardId,
    currentUser?.id,
    deleteCard,
    deleteColumn,
    moveCard,
    moveColumn,
    removeUserFromCard,
    setPresence,
    updateCard,
    updateColumn,
  ]);
}
