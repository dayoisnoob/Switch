// stores/board.store.ts
import { create } from "zustand";
import {
  BoardState,
  BoardColumn,
  BoardCard,
  BoardLabel,
  BoardAssignee,
} from "@/types/board.types";

interface BoardStore {
  board: BoardState | null;
  workspaceLabels: BoardLabel[];
  presenceUsers: PresenceUser[];

  // Hydration
  setBoard: (board: BoardState) => void;
  setWorkspaceLabels: (labels: BoardLabel[]) => void;

  // Card operations
  addCard: (columnId: string, card: BoardCard) => void;
  updateCard: (cardId: string, updates: Partial<BoardCard>) => void;
  deleteCard: (cardId: string, columnId: string) => void;
  moveCard: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    newIndex: number,
  ) => void;

  // Column operations
  addColumn: (column: BoardColumn) => void;
  updateColumn: (columnId: string, name: string) => void;
  deleteColumn: (columnId: string) => void;

  // Label operations
  addLabelToCard: (cardId: string, label: BoardLabel) => void;
  removeLabelFromCard: (cardId: string, labelId: string) => void;
  addWorkspaceLabel: (label: BoardLabel) => void;

  // Assignee Operations
  assignUserToCard: (cardId: string, assignee: BoardAssignee) => void;
  removeUserFromCard: (cardId: string, userId: string) => void;

  setPresence: (users: PresenceUser[]) => void;
}

export const useBoardStore = create<BoardStore>((set) => ({
  board: null,
  workspaceLabels: [],
  presenceUsers: [],

  setBoard: (board) =>
    set({
      board: {
        ...board,
        columns: [...board.columns].sort((a, b) => a.order - b.order),
      },
    }),

  setWorkspaceLabels: (labels) => set({ workspaceLabels: labels }),

  // ─── Cards ───────────────────────────────────────────────

  addCard: (columnId, card) =>
    set((state) => {
      if (!state.board) return state;
      return {
        board: {
          ...state.board,
          columns: state.board.columns.map((col) =>
            col.id === columnId ? { ...col, cards: [...col.cards, card] } : col,
          ),
        },
      };
    }),

  updateCard: (cardId, updates) =>
    set((state) => {
      if (!state.board) return state;
      return {
        board: {
          ...state.board,
          columns: state.board.columns.map((col) => ({
            ...col,
            cards: col.cards.map((card) =>
              card.id === cardId ? { ...card, ...updates } : card,
            ),
          })),
        },
      };
    }),

  deleteCard: (cardId, columnId) =>
    set((state) => {
      if (!state.board) return state;
      return {
        board: {
          ...state.board,
          columns: state.board.columns.map((col) =>
            col.id === columnId
              ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
              : col,
          ),
        },
      };
    }),

  moveCard: (cardId, fromColumnId, toColumnId, newIndex) =>
    set((state) => {
      if (!state.board) return state;

      const columns = state.board.columns.map((col) => ({
        ...col,
        cards: [...col.cards],
      }));

      const fromCol = columns.find((c) => c.id === fromColumnId);
      const toCol = columns.find((c) => c.id === toColumnId);
      if (!fromCol || !toCol) return state;

      const cardIndex = fromCol.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return state;

      const [card] = fromCol.cards.splice(cardIndex, 1);
      toCol.cards.splice(newIndex, 0, card);

      return { board: { ...state.board, columns } };
    }),

  // ─── Columns ─────────────────────────────────────────────

  addColumn: (column) =>
    set((state) => {
      if (!state.board) return state;
      return {
        board: {
          ...state.board,
          columns: [...state.board.columns, column],
        },
      };
    }),

  updateColumn: (columnId, name) =>
    set((state) => {
      if (!state.board) return state;
      return {
        board: {
          ...state.board,
          columns: state.board.columns.map((col) =>
            col.id === columnId ? { ...col, name } : col,
          ),
        },
      };
    }),

  deleteColumn: (columnId) =>
    set((state) => {
      if (!state.board) return state;
      return {
        board: {
          ...state.board,
          columns: state.board.columns.filter((col) => col.id !== columnId),
        },
      };
    }),

  // ─── Labels ──────────────────────────────────────────────

  addLabelToCard: (cardId, label) =>
    set((state) => {
      if (!state.board) return state;
      return {
        board: {
          ...state.board,
          columns: state.board.columns.map((col) => ({
            ...col,
            cards: col.cards.map((card) =>
              card.id === cardId
                ? { ...card, labels: [...(card.labels || []), label] }
                : card,
            ),
          })),
        },
      };
    }),

  removeLabelFromCard: (cardId, labelId) =>
    set((state) => {
      if (!state.board) return state;
      return {
        board: {
          ...state.board,
          columns: state.board.columns.map((col) => ({
            ...col,
            cards: col.cards.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    labels: card.labels.filter((l) => l.id !== labelId),
                  }
                : card,
            ),
          })),
        },
      };
    }),

  addWorkspaceLabel: (label) =>
    set((state) => ({ workspaceLabels: [...state.workspaceLabels, label] })),

  // ------ Assignees ------------------------------------------

  assignUserToCard: (cardId, assignee) =>
    set((state) => {
      if (!state.board) return state;
      return {
        board: {
          ...state.board,
          columns: state.board.columns.map((col) => ({
            ...col,
            cards: col.cards.map((card) =>
              card.id === cardId
                ? { ...card, assignees: [...card.assignees, assignee] }
                : card,
            ),
          })),
        },
      };
    }),

  removeUserFromCard: (cardId, userId) =>
    set((state) => {
      if (!state.board) return state;
      return {
        board: {
          ...state.board,
          columns: state.board.columns.map((col) => ({
            ...col,
            cards: col.cards.map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    assignees: card.assignees.filter(
                      (a) => a.userId !== userId,
                    ),
                  }
                : card,
            ),
          })),
        },
      };
    }),

  setPresence: (users) => set({ presenceUsers: users }),
}));

type PresenceUser = {
  userId: string;
  firstName: string;
  avatarUrl: string | null;
};
