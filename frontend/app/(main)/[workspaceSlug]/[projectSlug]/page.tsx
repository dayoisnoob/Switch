"use client";

import { cn, getErrorMessage } from "@/lib/utils";
import {
  Edit2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { useCreateCard, useMoveCard } from "@/hooks/useCards";
import {
  useDeleteColumn,
  useMoveColumn,
  useRenameColumn,
} from "@/hooks/useColumns";
import { useGetProjectBySlug } from "@/hooks/useProjects";
import { useBoardStore } from "@/store/board.store";
import { BoardCard, BoardColumn } from "@/types/board.types";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Helpers (Unchanged)
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

// --- Styling Helpers ---
const getColumnColor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("backlog")) return "bg-[#52525b]"; // Zinc
  if (lower.includes("progress")) return "bg-[#a855f7]"; // Purple
  if (lower.includes("review")) return "bg-[#f59e0b]"; // Amber
  if (lower.includes("done")) return "bg-[#10b981]"; // Emerald
  return "bg-[#7C6EF5]"; // Default Primary
};

const getPriorityStyles = (priority: string) => {
  const p = priority?.toLowerCase() || "none";
  switch (p) {
    case "urgent":
      return "bg-rose-500/10 text-rose-500 border-rose-500/20 dot-rose-500";
    case "high":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20 dot-purple-500";
    case "medium":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20 dot-amber-500";
    case "low":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dot-emerald-500";
    default:
      return "bg-white/5 text-white/40 border-white/10 dot-white/40";
  }
};

// ---------------------------------------------------------------------------
// Page (Logic Unchanged, Styled Wrapper)
// ---------------------------------------------------------------------------

export default function KanbanBoardPage() {
  const { workspaceSlug, projectSlug } = useParams() as {
    workspaceSlug: string;
    projectSlug: string;
  };

  const router = useRouter();

  const { data: project } = useGetProjectBySlug(workspaceSlug, projectSlug);
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

  const isMutatingRef = useRef(false);

  useEffect(() => {
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

  // [Drag Handlers Omitted for brevity - LEAVE YOUR EXACT DRAG FUNCTIONS HERE]
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

      const isCrossColumn =
        sourceColumnIdRef.current !== null &&
        targetColumnIdRef.current !== null &&
        sourceColumnIdRef.current !== targetColumnIdRef.current;

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

      const activeCol = findColumnInSnapshot(activeId, columns);
      const overCol = findColumnInSnapshot(overId, columns);
      if (!activeCol || !overCol) return;

      const fromIndex = activeCol.cards.findIndex((c) => c.id === activeId);
      const toIndex = overCol.cards.findIndex((c) => c.id === overId);

      if (fromIndex === toIndex && !isCrossColumn) {
        sourceColumnIdRef.current = null;
        targetColumnIdRef.current = null;
        return;
      }

      const reorderedCols = columns.map((col) => {
        if (col.id === activeCol.id) {
          return { ...col, cards: arrayMove(col.cards, fromIndex, toIndex) };
        }
        return col;
      });

      const updatedCol = reorderedCols.find((c) => c.id === activeCol.id)!;
      const finalIndex = updatedCol.cards.findIndex((c) => c.id === activeId);

      const prevOrder = updatedCol.cards[finalIndex - 1]?.order ?? 0;
      const nextOrder =
        updatedCol.cards[finalIndex + 1]?.order ?? prevOrder + 2;
      const newOrder = (prevOrder + nextOrder) / 2;

      setColumns(reorderedCols);

      sourceColumnIdRef.current = null;
      targetColumnIdRef.current = null;

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

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A]">
      {/* ── HEADER ── */}
      <header className="px-8 h-16 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A]/80 backdrop-blur-md shrink-0 z-10">
        <h1 className="text-lg font-bold text-white/90 tracking-tight">
          {project?.name || "Board"}
        </h1>
      </header>

      {/* ── MAIN BOARD AREA ── */}
      <main className="flex-1 overflow-auto custom-scrollbar p-6">
        {isBoardLoading ? (
          <div className="flex gap-6 h-full">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-85 h-125 bg-white/2 border border-white/5 rounded-2xl animate-pulse"
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
              <div className="flex gap-6 items-start w-max min-h-full pb-8">
                {columns.map((column) => (
                  <SortableColumn
                    key={column.id}
                    column={column}
                    setColumns={setColumns}
                    workspaceSlug={workspaceSlug}
                    projectSlug={projectSlug}
                    router={router}
                  />
                ))}

                {/* ADD COLUMN BUTTON */}
                <button
                  onClick={() => setIsColumnModalOpen(true)}
                  className="flex items-center justify-center gap-2 w-85 shrink-0 h-15 rounded-2xl border border-dashed border-white/10 bg-white/1 text-white/40 font-medium hover:text-white/80 hover:bg-white/3 hover:border-white/20 transition-all group"
                >
                  <Plus
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  Add Column
                </button>
              </div>
            </SortableContext>

            {/* DRAG OVERLAY */}
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
// SortableColumn (Premium Styling)
// ---------------------------------------------------------------------------

function SortableColumn({
  column,
  setColumns,
  workspaceSlug,
  projectSlug,
  router,
}: {
  column: BoardColumn;
  setColumns: React.Dispatch<React.SetStateAction<BoardColumn[]>>;
  workspaceSlug: string;
  projectSlug: string;
  router: any;
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
        `Cannot delete "${column.name}". Please move or delete the cards inside it first.`,
      );
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${column.name}"?`))
      return;
    try {
      deleteCol({ columnId: column.id });
      setColumns((prev) => prev.filter((col) => col.id !== column.id));
    } catch (err) {
      toast.error(getErrorMessage(err) || "Failed to delete column");
    }
  };

  const dotColor = getColumnColor(column.name);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col h-max w-85 shrink-0 bg-white/1 border border-white/5 rounded-2xl overflow-hidden shadow-sm"
    >
      {/* COLUMN HEADER */}
      <div
        {...attributes}
        {...listeners}
        className="p-4 flex items-center justify-between border-b border-white/5 cursor-grab active:cursor-grabbing hover:bg-white/2 transition-colors group"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
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
              className="bg-black/50 border border-[#7C6EF5] rounded-md px-2 py-1 text-sm font-bold text-white w-full outline-none"
            />
          ) : (
            <>
              <div className={cn("w-2 h-2 rounded-full shrink-0", dotColor)} />
              <h3 className="text-[14px] font-bold text-white/90 select-none truncate">
                {column.name}
              </h3>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Menu Button (Reveals on hover) */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-white/20 hover:text-white/80 p-1 rounded-md hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreHorizontal size={14} />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-[#121212] border border-white/8 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="p-1 flex flex-col">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setIsMenuOpen(false);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-2.5 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white rounded-lg transition-colors w-full text-left"
                  >
                    <Edit2 size={14} /> Rename
                  </button>
                  <div className="h-px bg-white/5 my-1 mx-1" />
                  <button
                    onClick={handleDeleteColumn}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-2.5 py-2 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition-colors w-full text-left"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Count Badge */}
          {!isEditing && (
            <div className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-white/40 select-none shrink-0">
              {column.cards.length}
            </div>
          )}
        </div>
      </div>

      {/* COLUMN CONTENT (CARDS OR EMPTY STATE) */}
      <div className="flex-1 min-h-25">
        {column.cards.length === 0 ? (
          /* Premium Empty State */
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-10 h-10 rounded-xl border border-dashed border-white/20 flex items-center justify-center mb-3 bg-white/1">
              <Plus size={16} className="text-white/20" />
            </div>
            <p className="text-[12px] text-white/30 mb-4 leading-relaxed">
              No cards here yet. <br /> Drag one in or add below.
            </p>
          </div>
        ) : (
          <SortableContext
            id={column.id}
            items={column.cards.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3 p-3">
              {column.cards.map((card) => (
                <SortableCard
                  key={card.id}
                  card={card}
                  onClick={() =>
                    router.push(`/${workspaceSlug}/${projectSlug}/c/${card.id}`)
                  }
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>

      {/* COLUMN FOOTER / CREATE INPUT */}
      <div className="p-3 border-t border-white/2">
        <div onPointerDown={(e) => e.stopPropagation()}>
          <CreateInput
            buttonText="Add card"
            placeholder="Task title..."
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// ColumnContent (Drag Overlay specific to new styling)
// ---------------------------------------------------------------------------

function ColumnContent({
  column,
  isDragging,
}: {
  column: BoardColumn;
  isDragging?: boolean;
}) {
  const dotColor = getColumnColor(column.name);
  return (
    <div
      className={cn(
        "flex flex-col h-max w-85 shrink-0 bg-[#0A0A0A] rounded-2xl overflow-hidden",
        isDragging
          ? "border border-[#7C6EF5]/50 shadow-[0_0_30px_rgba(124,110,245,0.15)] scale-[1.02] opacity-90"
          : "border border-white/5",
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/2">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-2 h-2 rounded-full", dotColor)} />
          <h3 className="text-[14px] font-bold text-white/90">{column.name}</h3>
        </div>
        <div className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-white/40">
          {column.cards.length}
        </div>
      </div>
      <div className="p-6 text-center text-sm text-white/30 border-2 border-dashed border-white/10 mx-4 my-4 rounded-xl bg-white/1">
        {column.cards.length} Cards inside
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SortableCard (Unchanged wrapper)
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
// CardContent (Premium Styling)
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
  const pStyles = getPriorityStyles(card.priority);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-white/3 border rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all flex flex-col gap-3",
        isDragging
          ? "border-[#7C6EF5]/50 shadow-[0_0_20px_rgba(124,110,245,0.15)] scale-105 bg-[#121212]"
          : "border-white/5 hover:border-white/15 hover:bg-white/4 shadow-sm",
      )}
    >
      {/* TITLE */}
      <p className="text-[13px] font-semibold text-white/90 leading-snug group-hover:text-white transition-colors">
        {card.title}
      </p>

      {/* BOTTOM ROW: Priority & Mock Footer Info to match screenshot */}
      <div className="flex items-center justify-between mt-1">
        {/* Priority Badge */}
        {card.priority !== "none" ? (
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[9px] font-bold uppercase tracking-wider",
              pStyles,
            )}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            {card.priority}
          </div>
        ) : (
          <div /> // Empty div to keep flex-between spacing if no priority
        )}

        {/* Visual Footer Elements (Icons + Mock Avatars matching screenshot) */}
        <div className="flex items-center gap-3">
          {/* Mock comment count to match design density */}
          {Math.random() > 0.5 && (
            <div className="flex items-center gap-1 text-white/30 text-[10px] font-medium">
              <MessageSquare size={10} /> 2
            </div>
          )}
          {/* Mock Avatar */}
          <div className="w-5 h-5 rounded-full bg-[#7C6EF5] flex items-center justify-center text-[8px] font-black text-white shadow-sm ring-2 ring-[#0A0A0A]">
            JD
          </div>
        </div>
      </div>
    </div>
  );
});
