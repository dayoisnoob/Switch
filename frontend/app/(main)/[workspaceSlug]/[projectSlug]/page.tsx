"use client";

import { cn, getErrorMessage } from "@/lib/utils";
import {
  Edit2,
  GripHorizontal,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";

import { useBoard } from "@/hooks/board";
import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { CreateInput } from "@/components/board/CreateInput";
import CreateColumnModal from "@/components/modals/CreateColumnModal";
import { useGetProjectBySlug } from "@/hooks/useProjects";
import { useBoardStore } from "@/store/board.store";
import { BoardCard, BoardColumn } from "@/types/board.types";
import { toast } from "sonner";
import {
  useDeleteColumn,
  useMoveColumn,
  useRenameColumn,
} from "@/hooks/useColumns";
import { useCreateCard, useMoveCard } from "@/hooks/useCards";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findColumnInSnapshot(
  id: string,
  snapshot: BoardColumn[],
): BoardColumn | undefined {
  return (
    snapshot.find((c) => c.id === id) ??
    snapshot.find((c) => c.cards.some((card) => card.id === id))
  );
}

const collisionDetection: CollisionDetection = (args) => {
  if (args.active.data.current?.type === "Column") {
    return rectIntersection({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (c) => c.data?.current?.type === "Column",
      ),
    });
  }
  return closestCorners(args);
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function KanbanBoardPage() {
  const { workspaceSlug, projectSlug } = useParams() as {
    workspaceSlug: string;
    projectSlug: string;
  };

  const router = useRouter();

  const { data: project } = useGetProjectBySlug(projectSlug);
  const { isLoading: isBoardLoading } = useBoard(projectSlug, workspaceSlug);

  const board = useBoardStore((s) => s.board);

  const { mutate: moveCard } = useMoveCard();
  const { mutate: moveColumn } = useMoveColumn();

  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [activeDragColumn, setActiveDragColumn] = useState<BoardColumn | null>(
    null,
  );
  const [activeDragCard, setActiveDragCard] = useState<BoardCard | null>(null);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  // THE FIX: A synchronous ref to instantly lock the UI from syncing old server data
  const isMutatingRef = useRef(false);

  useEffect(() => {
    // Only sync if we are NOT dragging and NOT currently waiting for a mutation to settle
    if (
      board &&
      !activeDragColumn &&
      !activeDragCard &&
      !isMutatingRef.current
    ) {
      const fetchedColumns = Array.isArray(board) ? board : board.columns || [];
      const timeoutId = setTimeout(() => setColumns(fetchedColumns), 0);
      return () => clearTimeout(timeoutId);
    }
  }, [board, activeDragColumn, activeDragCard]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sourceColumnIdRef = useRef<string | null>(null);
  const targetColumnIdRef = useRef<string | null>(null);
  const lastOverKeyRef = useRef<string | null>(null);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const type = active.data.current?.type;

      if (type === "Column") {
        setActiveDragColumn(active.data.current?.column ?? null);
      } else if (type === "Card") {
        setActiveDragCard(active.data.current?.card ?? null);
        const sourceCol = findColumnInSnapshot(active.id as string, columns);
        sourceColumnIdRef.current = sourceCol?.id ?? null;
      }
    },
    [columns],
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === "Card";
    if (!isActiveCard) return;

    const overKey = `${activeId}:${overId}`;
    if (lastOverKeyRef.current === overKey) return;
    lastOverKeyRef.current = overKey;

    setColumns((prev) => {
      const activeCol = findColumnInSnapshot(activeId, prev);
      const overCol = findColumnInSnapshot(overId, prev);

      if (!activeCol || !overCol) return prev;
      if (activeCol.id === overCol.id) return prev;

      targetColumnIdRef.current = overCol.id;

      const activeIndex = activeCol.cards.findIndex((c) => c.id === activeId);
      const overIndex = overCol.cards.findIndex((c) => c.id === overId);
      const isOverColumn = over.data.current?.type === "Column";

      let newIndex: number;
      if (isOverColumn) {
        newIndex = overCol.cards.length;
      } else {
        const isBelowOverItem =
          active.rect.current.translated &&
          active.rect.current.translated.top >
            over.rect.top + over.rect.height / 2;
        newIndex =
          overIndex >= 0
            ? overIndex + (isBelowOverItem ? 1 : 0)
            : overCol.cards.length;
      }

      const cardToMove = activeCol.cards[activeIndex];

      return prev.map((col) => {
        if (col.id === activeCol.id) {
          return { ...col, cards: col.cards.filter((c) => c.id !== activeId) };
        }
        if (col.id === overCol.id) {
          const newCards = [...col.cards];
          newCards.splice(newIndex, 0, cardToMove);
          return { ...col, cards: newCards };
        }
        return col;
      });
    });
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragColumn(null);
      setActiveDragCard(null);
      lastOverKeyRef.current = null;

      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Track if it crossed column boundaries using our refs
      const isCrossColumn =
        sourceColumnIdRef.current !== null &&
        targetColumnIdRef.current !== null &&
        sourceColumnIdRef.current !== targetColumnIdRef.current;

      // ─── 1. COLUMN DRAG HANDLING ──────────────────────────────────────────
      if (active.data.current?.type === "Column") {
        if (activeId === overId) return;

        const fromIndex = columns.findIndex((c) => c.id === activeId);
        const toIndex = columns.findIndex((c) => c.id === overId);
        const reordered = arrayMove(columns, fromIndex, toIndex);

        const prevOrder = reordered[toIndex - 1]?.order ?? 0;
        const nextOrder = reordered[toIndex + 1]?.order ?? prevOrder + 2;
        const newOrder = (prevOrder + nextOrder) / 2;

        setColumns(reordered);
        isMutatingRef.current = true;
        moveColumn(
          { columnId: activeId, order: newOrder },
          {
            onSettled: () => {
              isMutatingRef.current = false;
            },
            onError: () => setColumns(columns),
          },
        );
        return;
      }

      // ─── 2. CARD DRAG HANDLING (The Unified Master Fix) ──────────────────
      const activeCol = findColumnInSnapshot(activeId, columns);
      const overCol = findColumnInSnapshot(overId, columns);
      if (!activeCol || !overCol) return;

      const fromIndex = activeCol.cards.findIndex((c) => c.id === activeId);
      const toIndex = overCol.cards.findIndex((c) => c.id === overId);

      // THE FATAL BUG FIX:
      // Only abort if the index didn't change AND the column didn't change!
      if (fromIndex === toIndex && !isCrossColumn) {
        sourceColumnIdRef.current = null;
        targetColumnIdRef.current = null;
        return;
      }

      // Let dnd-kit's native arrayMove handle the final visual shift seamlessly
      const reorderedCols = columns.map((col) => {
        if (col.id === activeCol.id) {
          return { ...col, cards: arrayMove(col.cards, fromIndex, toIndex) };
        }
        return col;
      });

      // Find the card's final resting place
      const updatedCol = reorderedCols.find((c) => c.id === activeCol.id)!;
      const finalIndex = updatedCol.cards.findIndex((c) => c.id === activeId);

      // Calculate the perfect fractional order for the database
      const prevOrder = updatedCol.cards[finalIndex - 1]?.order ?? 0;
      const nextOrder =
        updatedCol.cards[finalIndex + 1]?.order ?? prevOrder + 2;
      const newOrder = (prevOrder + nextOrder) / 2;

      // Lock the UI optimistic state
      setColumns(reorderedCols);

      // Reset refs for the next drag
      sourceColumnIdRef.current = null;
      targetColumnIdRef.current = null;

      // Fire the mutation!
      isMutatingRef.current = true;
      moveCard(
        {
          cardId: activeId,
          data: {
            columnId: updatedCol.id,
            order: newOrder,
            status: activeCol.mappedStatus,
          },
        },
        {
          onSettled: () => {
            isMutatingRef.current = false;
          },
          onError: () => setColumns(columns),
        },
      );
    },
    [columns, moveCard, moveColumn],
  );

  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  // ... [The rest of your JSX and sub-components remain perfectly identical]

  return (
    <div className="h-full flex flex-col bg-base">
      <header className="px-8 h-16 border-b border-md flex items-center justify-between bg-surface shrink-0 z-10">
        <h1 className="heading-md text-primary leading-tight">
          {project?.name}
        </h1>
      </header>

      <main className="flex-1 overflow-auto custom-scrollbar p-6">
        {isBoardLoading ? (
          <div className="flex gap-5 h-full">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[320px] h-125 bg-surface border border-md rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={columnIds}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex gap-5 items-start w-max min-h-full">
                {columns.map((column) => (
                  <SortableColumn
                    key={column.id}
                    column={column}
                    setColumns={setColumns}
                  >
                    <SortableContext
                      id={column.id}
                      items={column.cards.map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-3 px-3 min-h-12.5">
                        {column.cards.map((card) => (
                          <SortableCard
                            key={card.id}
                            card={card}
                            onClick={() =>
                              router.push(
                                `/${workspaceSlug}/${projectSlug}/c/${card.id}`,
                              )
                            }
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </SortableColumn>
                ))}

                <button
                  onClick={() => setIsColumnModalOpen(true)}
                  className="flex items-center gap-2 w-[320px] shrink-0 h-12 px-4 rounded-xl border border-dashed border-md bg-surface/50 text-secondary font-medium hover:text-primary hover:bg-surface hover:border-lg transition-all focus-ring"
                >
                  <Plus size={16} /> Add Column
                </button>
              </div>
            </SortableContext>

            <DragOverlay
              dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: { active: { opacity: "0.4" } },
                }),
              }}
            >
              {activeDragCard ? (
                <CardContent card={activeDragCard} isDragging />
              ) : null}
              {activeDragColumn ? (
                <ColumnContent column={activeDragColumn} isDragging />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {board && (
        <CreateColumnModal
          isOpen={isColumnModalOpen}
          onClose={() => setIsColumnModalOpen(false)}
          boardId={board.id}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SortableColumn
// ---------------------------------------------------------------------------

function SortableColumn({
  column,
  setColumns,
  children,
}: {
  column: BoardColumn;
  setColumns: React.Dispatch<React.SetStateAction<BoardColumn[]>>;
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.name);
  const menuRef = useRef<HTMLDivElement>(null);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: "Column", column } });

  const { mutateAsync: createCard } = useCreateCard(column.id);
  const { mutateAsync: renameCol } = useRenameColumn();
  const { mutateAsync: deleteCol } = useDeleteColumn();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current || menuRef.current.contains(event.target as Node))
        return;
      setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, []);

  const handleRenameSubmit = () => {
    setIsEditing(false);
    const newTitle = editTitle.trim();
    if (newTitle === "" || newTitle === column.name) {
      setEditTitle(column.name);
      return;
    }
    try {
      renameCol({ columnId: column.id, name: newTitle });
      setColumns((prev) =>
        prev.map((col) =>
          col.id === column.id ? { ...col, name: newTitle } : col,
        ),
      );
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to rename column");
      setEditTitle(column.name);
    }
  };

  const handleDeleteColumn = () => {
    setIsMenuOpen(false);
    if (column.cards.length > 0) {
      window.alert(
        `Cannot delete "${column.name}". Please move or delete the ${column.cards.length} cards inside it first.`,
      );
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to delete the empty column "${column.name}"?`,
      )
    )
      return;
    try {
      deleteCol({ columnId: column.id });
      setColumns((prev) => prev.filter((col) => col.id !== column.id));
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to delete column");
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col h-max w-[320px] shrink-0 bg-surface border border-md rounded-xl overflow-hidden pb-2"
    >
      <div
        {...attributes}
        {...listeners}
        className="p-3.5 flex items-center justify-between border-b border-md bg-card mb-2 cursor-grab active:cursor-grabbing hover:bg-overlay transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          <GripHorizontal size={14} className="text-muted shrink-0" />
          {isEditing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") {
                  setEditTitle(column.name);
                  setIsEditing(false);
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="input-premium text-sm font-semibold px-2 py-0.5 focus-ring w-full"
            />
          ) : (
            <>
              <h3 className="text-sm font-bold text-primary select-none truncate">
                {column.name}
              </h3>
              <span className="text-xs text-secondary bg-overlay px-1.5 py-0.5 rounded-md ml-1 select-none shrink-0">
                {column.cards.length}
              </span>
            </>
          )}
        </div>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-muted hover:text-primary p-1 rounded-md hover:bg-overlay transition-colors focus-ring"
          >
            <MoreHorizontal size={16} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-surface border border-md rounded-lg shadow-soft z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="p-1 flex flex-col">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setIsMenuOpen(false);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-secondary hover:bg-overlay hover:text-primary rounded cursor-pointer transition-colors w-full text-left focus-ring"
                >
                  <Edit2 size={14} /> Rename
                </button>
                <div className="h-px bg-border my-1 mx-1" />
                <button
                  onClick={handleDeleteColumn}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-danger hover:bg-danger/10 hover:text-red-400 rounded cursor-pointer transition-colors w-full text-left focus-ring"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {children}
      <div className="px-3 pt-3 mt-1">
        <CreateInput
          buttonText="Add Card"
          placeholder="What needs to be done?"
          onSubmit={async (title) => {
            const newCard = await createCard({
              title,
              status: column.mappedStatus,
            });
            setColumns((prev) =>
              prev.map((col) =>
                col.id === column.id
                  ? { ...col, cards: [...col.cards, newCard] }
                  : col,
              ),
            );
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ColumnContent (drag overlay)
// ---------------------------------------------------------------------------

function ColumnContent({
  column,
  isDragging,
}: {
  column: BoardColumn;
  isDragging?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col h-max w-[320px] shrink-0 bg-surface border rounded-xl overflow-hidden pb-2",
        isDragging
          ? "border-accent shadow-accent scale-[1.02] opacity-90"
          : "border-md",
      )}
    >
      <div className="p-3.5 flex items-center gap-2 border-b border-md bg-card mb-2">
        <GripHorizontal size={14} className="text-muted mr-1" />
        <h3 className="text-sm font-bold text-primary">{column.name}</h3>
      </div>
      <div className="px-3 py-4 text-center text-sm text-secondary font-medium border-2 border-dashed border-md mx-3 rounded-lg">
        {column.cards.length} Cards
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SortableCard
// FIX 3: wrapped in memo so a card only re-renders when its own data changes.
// Without this, every setColumns call (which happens on every drag-over)
// causes every card in every column to re-render, even untouched ones.
// ---------------------------------------------------------------------------

const SortableCard = memo(function SortableCard({
  card,
  onClick,
}: {
  card: BoardCard;
  onClick: () => void;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: "Card", card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="outline-none touch-none"
    >
      <CardContent card={card} isDragging={isDragging} onClick={onClick} />
    </div>
  );
});

// ---------------------------------------------------------------------------
// CardContent
// FIX 3 (cont): also memo'd. The drag overlay renders this directly, and
// during a drag every pointermove would otherwise re-create it.
// ---------------------------------------------------------------------------

const CardContent = memo(function CardContent({
  card,
  isDragging,
  onClick,
}: {
  card: BoardCard;
  isDragging?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-card border rounded-lg p-3.5 cursor-grab active:cursor-grabbing transition-colors shadow-sm",
        isDragging
          ? "border-accent shadow-accent scale-105"
          : "border-md hover:border-lg",
      )}
    >
      {card.priority !== "none" && (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-2 inline-block bg-accent-dim text-accent border border-accent/20">
          {card.priority}
        </span>
      )}
      <p className="text-sm font-medium text-primary leading-snug mb-2">
        {card.title}
      </p>
    </div>
  );
});
