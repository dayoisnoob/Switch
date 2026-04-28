"use client";

import { cn, getErrorMessage } from "@/lib/utils";
import { Edit2, GripHorizontal, MoreHorizontal, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  useBoard,
  useCreateCard,
  useCreateColumn,
  useDeleteColumn,
  useMoveCard,
  useRenameColumn,
  useReorderColumn,
} from "@/hooks/board";
import { useProjectBySlug } from "@/hooks/useProjects";
import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
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
import { useBoardStore } from "@/store/board.store";
import { BoardCard, BoardColumn, BoardState } from "@/types/board.types";
import { toast } from "sonner";

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

export default function KanbanBoardPage() {
  const { workspaceSlug, projectSlug } = useParams() as {
    workspaceSlug: string;
    projectSlug: string;
  };

  const router = useRouter();

  const { data: project } = useProjectBySlug(projectSlug);
  const { isLoading: isBoardLoading } = useBoard(projectSlug, workspaceSlug);

  const board = useBoardStore((s) => s.board);

  const { mutate: moveCard } = useMoveCard();
  const { mutate: reorderColumn } = useReorderColumn();
  const { mutateAsync: createColumn } = useCreateColumn();

  const [columns, setColumns] = useState<BoardColumn[]>([]);
  //   const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [activeDragColumn, setActiveDragColumn] = useState<BoardColumn | null>(
    null,
  );
  const [activeDragCard, setActiveDragCard] = useState<BoardCard | null>(null);
  const [lastSyncedBoard, setLastSyncedBoard] = useState<BoardState | null>(
    null,
  );

  if (
    board &&
    board !== lastSyncedBoard &&
    !activeDragColumn &&
    !activeDragCard
  ) {
    setLastSyncedBoard(board);
    const fetchedColumns = Array.isArray(board) ? board : board.columns || [];
    setColumns(fetchedColumns);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sourceColumnIdRef = useRef<string | null>(null);
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

  const targetColumnIdRef = useRef<string | null>(null);
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === "Card";
    if (!isActiveCard) return;

    const isOverColumn = over.data.current?.type === "Column";

    setColumns((prev) => {
      const activeCol = findColumnInSnapshot(activeId, prev);
      const overCol = findColumnInSnapshot(overId, prev);

      if (!activeCol || !overCol) return prev;
      if (activeCol.id === overCol.id) return prev;

      targetColumnIdRef.current = overCol.id;

      const activeIndex = activeCol.cards.findIndex((c) => c.id === activeId);
      const overIndex = overCol.cards.findIndex((c) => c.id === overId);

      let newIndex: number;
      if (isOverColumn) {
        newIndex = overCol.cards.length;
      } else {
        const isBelowOverItem =
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;
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

      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const isCrossColumn =
        targetColumnIdRef.current !== null &&
        targetColumnIdRef.current !== sourceColumnIdRef.current;

      if (activeId === overId && !isCrossColumn) return;

      const isActiveColumn = active.data.current?.type === "Column";

      // ── 1. COLUMN REORDERING ──
      if (isActiveColumn) {
        // Calculate the new order using your current `columns` state
        const fromIndex = columns.findIndex((c) => c.id === activeId);
        const toIndex = columns.findIndex((c) => c.id === overId);
        const reordered = arrayMove(columns, fromIndex, toIndex);

        const prevOrder = reordered[toIndex - 1]?.order ?? 0;
        const nextOrder = reordered[toIndex + 1]?.order ?? prevOrder + 2;
        const newOrder = (prevOrder + nextOrder) / 2;

        // 1. Update UI instantly (Pure)
        setColumns(reordered);

        // 2. Fire API exactly once (Side Effect)
        reorderColumn(
          { columnId: activeId, order: newOrder },
          { onError: () => setColumns(columns) }, // Rollback on error
        );
        return;
      }

      const targetColId = targetColumnIdRef.current;
      sourceColumnIdRef.current = null;
      targetColumnIdRef.current = null;

      // ── 2. CROSS-COLUMN CARD DRAG ──
      if (isCrossColumn) {
        const targetCol = columns.find((c) => c.id === targetColId);
        if (!targetCol) return;

        const cardIndex = targetCol.cards.findIndex((c) => c.id === activeId);
        const prevOrder = targetCol.cards[cardIndex - 1]?.order ?? 0;
        const nextOrder =
          targetCol.cards[cardIndex + 1]?.order ?? prevOrder + 2;
        const newOrder = (prevOrder + nextOrder) / 2;

        // Note: dnd-kit usually handles the actual cross-column array mutation
        // in `onDragOver`, so we don't need to call setColumns here!

        // Fire API exactly once
        moveCard(
          { cardId: activeId, columnId: targetColId!, order: newOrder },
          { onError: () => setColumns(columns) },
        );
        return;
      }

      // ── 3. SAME-COLUMN CARD DRAG ──
      const activeCol = findColumnInSnapshot(activeId, columns);
      const overCol = findColumnInSnapshot(overId, columns);
      if (!activeCol || !overCol) return;

      const fromIndex = activeCol.cards.findIndex((c) => c.id === activeId);
      const toIndex = overCol.cards.findIndex((c) => c.id === overId);
      if (fromIndex === toIndex) return;

      const reorderedCols = columns.map((col) => {
        if (col.id !== activeCol.id) return col;
        return { ...col, cards: arrayMove(col.cards, fromIndex, toIndex) };
      });

      const updatedCol = reorderedCols.find((c) => c.id === activeCol.id)!;
      const prevOrder = updatedCol.cards[toIndex - 1]?.order ?? 0;
      const nextOrder = updatedCol.cards[toIndex + 1]?.order ?? prevOrder + 2;
      const newOrder = (prevOrder + nextOrder) / 2;

      // 1. Update UI instantly (Pure)
      setColumns(reorderedCols);

      // 2. Fire API exactly once (Side Effect)
      moveCard(
        { cardId: activeId, columnId: activeCol.id, order: newOrder },
        { onError: () => setColumns(columns) },
      );
    },
    // IMPORTANT: Make sure `columns` is in your dependency array so it has the freshest data!
    [columns, reorderColumn, moveCard],
  );

  return (
    <div className="h-full flex flex-col bg-[#0b0e14]">
      <header className="px-8 h-16 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117] shrink-0 z-10">
        <h1 className="text-sm font-bold text-[#f0f6fc] leading-tight">
          {project?.name}
        </h1>
      </header>

      <main className="flex-1 overflow-auto custom-scrollbar p-6">
        {isBoardLoading ? (
          <div className="flex gap-5 h-full">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[320px] h-125 bg-[#0d1117] border border-[#30363d] rounded-xl animate-pulse"
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
              items={columns.map((c) => c.id)}
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

                <CreateInput
                  isColumn
                  buttonText="Add Column"
                  placeholder="e.g. In Review"
                  onSubmit={async (title) => {
                    if (!board) return;
                    const newCol = await createColumn({
                      boardId: board.id,
                      name: title,
                    });

                    setColumns((prev) => [...prev, newCol]);
                  }}
                />
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
    </div>
  );
}

function SortableColumn({
  column,
  setColumns,
  children,
}: {
  column: BoardColumn;
  setColumns: React.Dispatch<React.SetStateAction<BoardColumn[]>>;
  children: React.ReactNode;
}) {
  // --- NEW COLUMN MANAGEMENT STATE ---
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
  } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  });

  const { mutateAsync: createCard } = useCreateCard();
  const { mutateAsync: renameCol } = useRenameColumn();
  const { mutateAsync: deleteCol } = useDeleteColumn();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  // --- NEW: CLOSE MENU ON OUTSIDE CLICK ---
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current || menuRef.current.contains(event.target as Node)) {
        return;
      }
      setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, []);

  // --- NEW: HANDLE RENAME SUBMIT ---
  const handleRenameSubmit = () => {
    setIsEditing(false);
    const newTitle = editTitle.trim();

    if (newTitle === "" || newTitle === column.name) {
      setEditTitle(column.name);
      return;
    }

    try {
      renameCol({ columnId: column.id, name: newTitle });

      setColumns((prevColumns) =>
        prevColumns.map((col) => {
          if (col.id === column.id) {
            return { ...col, name: newTitle };
          }
          return col;
        }),
      );
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg || "Failed to rename column");
      setEditTitle(column.name);
    }
  };

  const handleDeleteColumn = () => {
    setIsMenuOpen(false);
    if (column.cards.length > 0) {
      // TODO: create a small modal for confirmation
      window.alert(
        `Cannot delete "${column.name}". Please move or delete the ${column.cards.length} cards inside it first.`,
      );
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to delete the empty column "${column.name}"?`,
    );
    if (!confirm) return;

    try {
      deleteCol({ columnId: column.id });

      setColumns((prevColumns) =>
        prevColumns.filter((col) => col.id !== column.id),
      );
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg || "Failed to delete column");
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col h-max w-[320px] shrink-0 bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden pb-2"
    >
      <div
        {...attributes}
        {...listeners}
        className="p-3.5 flex items-center justify-between border-b border-[#30363d]/50 bg-[#11141a] mb-2 cursor-grab active:cursor-grabbing hover:bg-[#161b22] transition-colors"
      >
        {/* HEADER LEFT SIDE: GRIP + TITLE/INPUT */}
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          <GripHorizontal size={14} className="text-[#484f58] shrink-0" />

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
              // CRUCIAL: Stop dragging when typing
              onPointerDown={(e) => e.stopPropagation()}
              className="bg-[#1c2128] text-sm font-semibold text-[#f0f6fc] px-2 py-0.5 rounded border border-[#58a6ff] focus:outline-none w-full"
            />
          ) : (
            <>
              <h3 className="text-sm font-semibold text-[#f0f6fc] select-none truncate">
                {column.name}
              </h3>
              <span className="text-xs text-[#8b949e] bg-[#1c2128] px-1.5 py-0.5 rounded-md ml-1 select-none shrink-0">
                {column.cards.length}
              </span>
            </>
          )}
        </div>

        {/* HEADER RIGHT SIDE: MENU */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            // CRUCIAL: Stop dragging when clicking the menu button
            onPointerDown={(e) => e.stopPropagation()}
            className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded-md hover:bg-[#1c2128] transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>

          {/* FLOATING MENU */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-[#161b22] border border-[#30363d] rounded-md shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="p-1 flex flex-col">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setIsMenuOpen(false);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-[#c9d1d9] hover:bg-[#1c2128] hover:text-[#f0f6fc] rounded cursor-pointer transition-colors w-full text-left"
                >
                  <Edit2 size={14} /> Rename
                </button>
                <div className="h-px bg-[#30363d] my-1 mx-1" />
                <button
                  onClick={handleDeleteColumn}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-2 py-2 text-sm text-red-400 hover:bg-[#1c2128] hover:text-red-300 rounded cursor-pointer transition-colors w-full text-left"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CHILDREN (CARDS) */}
      {children}

      {/* CARD CREATION INPUT */}
      <div className="px-3 pt-3 mt-1">
        <CreateInput
          buttonText="Add Card"
          placeholder="What needs to be done?"
          onSubmit={async (title) => {
            const newCard = await createCard({ columnId: column.id, title });

            setColumns((prev) =>
              prev.map((col) => {
                if (col.id === column.id) {
                  return {
                    ...col,
                    cards: [...col.cards, newCard],
                  };
                }
                return col;
              }),
            );
          }}
        />
      </div>
    </div>
  );
}

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
        "flex flex-col h-max w-[320px] shrink-0 bg-[#0d1117] border rounded-xl overflow-hidden pb-2",
        isDragging
          ? "border-[#58a6ff] shadow-2xl scale-[1.02] opacity-90"
          : "border-[#30363d]",
      )}
    >
      <div className="p-3.5 flex items-center gap-2 border-b border-[#30363d]/50 bg-[#11141a] mb-2">
        <GripHorizontal size={14} className="text-[#484f58] mr-1" />
        <h3 className="text-sm font-semibold text-[#f0f6fc]">{column.name}</h3>
      </div>
      <div className="px-3 py-4 text-center text-sm text-[#484f58] font-medium border-2 border-dashed border-[#30363d] mx-3 rounded-lg">
        {column.cards.length} Cards
      </div>
    </div>
  );
}

function SortableCard({
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
  } = useSortable({
    id: card.id,
    data: { type: "Card", card },
  });

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
      className="outline-none"
    >
      <CardContent card={card} isDragging={isDragging} onClick={onClick} />
    </div>
  );
}

function CardContent({
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
        "group bg-[#161b22] border rounded-lg p-3.5 cursor-grab active:cursor-grabbing transition-colors",
        isDragging
          ? "border-[#58a6ff] shadow-lg scale-105"
          : "border-[#30363d] hover:border-[#484f58]",
      )}
    >
      {card.priority !== "none" && (
        <span className="text-[10px] px-2 py-0.5 rounded border font-medium bg-red-500/10 text-red-400 border-red-500/20 mb-2 inline-block">
          {card.priority.toUpperCase()}
        </span>
      )}
      <p className="text-sm font-medium text-[#c9d1d9] leading-snug mb-2">
        {card.title}
      </p>
      {/* TODO: render card.assignees avatars here if present (AvatarGroup component) */}
      {/* TODO: render card.dueDate here if present (date-fns format) */}
      {/* TODO: render attachment/comment counts here if present */}
    </div>
  );
}
