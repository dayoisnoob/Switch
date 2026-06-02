"use client";

import { cn, formatDateShort, getErrorMessage } from "@/lib/utils";
import { generateKeyBetween } from "fractional-indexing";
import {
  Activity,
  Clock,
  Edit2,
  Eraser,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useBoard } from "@/hooks/useBoard";
import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  closestCenter,
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

import AddCardModal, {
  AddCardFormData,
} from "@/components/modals/AddCardModal";
import CreateColumnModal from "@/components/modals/CreateColumnModal";
import { formatAvatarUrls } from "@/components/workspace/WorkspaceCard";
import { useBoardSocket } from "@/hooks/useBoardSocket";
import { useCreateCard, useMoveCard } from "@/hooks/useCards";
import {
  useClearColumncards,
  useDeleteColumn,
  useMoveColumn,
  useUpdateColumn,
} from "@/hooks/useColumns";
import { useGetProjectBySlug } from "@/hooks/useProjects";
import {
  useGetMembers,
  useWorkspaceRole,
  WorkspaceMembers,
} from "@/hooks/useWorkspace";
import { useBoardStore } from "@/store/board.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import { BoardCard, BoardColumn } from "@/types/board.types";
import { toast } from "sonner";
import DeleteColumnModal from "@/components/modals/DeleteColumnModal";
import { KanbanBoardSkeleton } from "@/components/skeletons/BoardPage";

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
  return closestCenter(args);
};

const getColumnColor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("backlog")) return "bg-[#52525b]";
  if (lower.includes("progress")) return "bg-[#a855f7]";
  if (lower.includes("review")) return "bg-[#f59e0b]";
  if (lower.includes("done")) return "bg-[#10b981]";
  return "bg-[#7C6EF5]";
};

const getPriorityStyles = (priority: string) => {
  const p = priority?.toLowerCase() || "none";
  switch (p) {
    case "urgent":
      return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    case "high":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "low":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    default:
      return "bg-white/5 text-white/40 border-white/10";
  }
};

export default function KanbanBoardPage() {
  const { workspaceSlug, projectSlug } = useParams() as {
    workspaceSlug: string;
    projectSlug: string;
  };

  const router = useRouter();

  const { data: project } = useGetProjectBySlug(workspaceSlug, projectSlug);
  const { isLoading: isBoardLoading } = useBoard(projectSlug, workspaceSlug);
  const { data: workspaceMembers = [], isLoading: membersLoading } =
    useGetMembers(workspaceSlug);

  const board = useBoardStore((s) => s.board);
  useBoardSocket(board?.id ?? "");

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
  const dragOverFrameRef = useRef<number | null>(null);
  const pendingDragOverRef = useRef<DragOverEvent | null>(null);
  const dragStartColumnsRef = useRef<BoardColumn[] | null>(null);

  const resetCardDragRefs = useCallback(() => {
    sourceColumnIdRef.current = null;
    targetColumnIdRef.current = null;
    dragStartColumnsRef.current = null;
  }, []);

  const restoreCardDragSnapshot = useCallback(() => {
    if (dragStartColumnsRef.current) {
      setColumns(dragStartColumnsRef.current);
    }
    resetCardDragRefs();
  }, [resetCardDragRefs]);

  const applyDragOver = useCallback((event: DragOverEvent) => {
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
      if (activeIndex === -1) return prev;

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

  useEffect(() => {
    return () => {
      if (dragOverFrameRef.current !== null) {
        cancelAnimationFrame(dragOverFrameRef.current);
      }
    };
  }, []);

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
        dragStartColumnsRef.current = columns;
      }
    },
    [columns],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      pendingDragOverRef.current = event;

      if (dragOverFrameRef.current !== null) return;

      dragOverFrameRef.current = requestAnimationFrame(() => {
        dragOverFrameRef.current = null;
        const pendingEvent = pendingDragOverRef.current;
        pendingDragOverRef.current = null;

        if (pendingEvent) applyDragOver(pendingEvent);
      });
    },
    [applyDragOver],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragColumn(null);
      setActiveDragCard(null);
      pendingDragOverRef.current = null;
      if (dragOverFrameRef.current !== null) {
        cancelAnimationFrame(dragOverFrameRef.current);
        dragOverFrameRef.current = null;
      }
      lastOverKeyRef.current = null;

      const { active, over } = event;
      if (!over) {
        restoreCardDragSnapshot();
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      if (active.data.current?.type === "Column") {
        dragStartColumnsRef.current = null;
      }

      const isCrossColumn =
        sourceColumnIdRef.current !== null &&
        targetColumnIdRef.current !== null &&
        sourceColumnIdRef.current !== targetColumnIdRef.current;

      if (active.data.current?.type === "Column") {
        if (activeId === overId) return;
        const fromIndex = columns.findIndex((c) => c.id === activeId);
        const toIndex = columns.findIndex((c) => c.id === overId);
        const reordered = arrayMove(columns, fromIndex, toIndex);
        const prevOrder = reordered[toIndex - 1]?.order ?? null;
        const nextOrder = reordered[toIndex + 1]?.order ?? null;
        const newOrder = generateKeyBetween(prevOrder, nextOrder);

        setColumns(
          reordered.map((col, i) =>
            i === toIndex ? { ...col, order: newOrder } : col,
          ),
        );
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
      if (!activeCol || !overCol) {
        restoreCardDragSnapshot();
        return;
      }

      const fromIndex = activeCol.cards.findIndex((c) => c.id === activeId);
      const toIndex = overCol.cards.findIndex((c) => c.id === overId);

      if (fromIndex === toIndex && !isCrossColumn) {
        resetCardDragRefs();
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

      const prevOrder = updatedCol.cards[finalIndex - 1]?.order ?? null;
      const nextOrder = updatedCol.cards[finalIndex + 1]?.order ?? null;
      const newOrder = generateKeyBetween(prevOrder, nextOrder);

      setColumns(reorderedCols);

      resetCardDragRefs();

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
    [columns, moveCard, moveColumn, resetCardDragRefs, restoreCardDragSnapshot],
  );

  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#0E0E14]">
      <header className="px-8 h-16 border-b border-white/5 flex items-center justify-between bg-[#0A0A0A]/80 backdrop-blur-md shrink-0 z-10">
        <h1 className="text-lg font-bold text-white/90 tracking-tight">
          {project?.name || "Board"}
        </h1>
      </header>

      <main className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden custom-scrollbar p-6">
        {isBoardLoading ? (
          <KanbanBoardSkeleton />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always,
              },
            }}
          >
            <SortableContext
              items={columnIds}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex gap-6 items-start w-max min-h-0 pb-2">
                {columns.map((column) => (
                  <SortableColumn
                    key={column.id}
                    column={column}
                    setColumns={setColumns}
                    workspaceSlug={workspaceSlug}
                    projectSlug={projectSlug}
                    projectName={project?.name}
                    router={router}
                    workspaceMembers={workspaceMembers}
                    membersLoading={membersLoading}
                  />
                ))}

                <button
                  onClick={() => setIsColumnModalOpen(true)}
                  className="self-start flex items-center justify-center gap-2 w-85 shrink-0 h-15 rounded-2xl border border-dashed border-white/10 bg-white/1 text-white/40 font-medium hover:text-white/80 hover:bg-white/3 hover:border-white/20 transition-all group"
                >
                  <Plus
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                  Add Column
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

const SortableColumn = memo(function SortableColumn({
  column,
  setColumns,
  workspaceSlug,
  projectSlug,
  projectName,
  router,
  workspaceMembers,
  membersLoading,
}: {
  column: BoardColumn;
  setColumns: React.Dispatch<React.SetStateAction<BoardColumn[]>>;
  workspaceSlug: string;
  projectSlug: string;
  projectName?: string;
  router: ReturnType<typeof useRouter>;
  workspaceMembers: WorkspaceMembers[];
  membersLoading: boolean;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(column.name);

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  const menuRef = useRef<HTMLDivElement>(null);
  const { canManageWorkspace } = useWorkspaceRole();

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: "Column", column } });

  const { mutateAsync: createCard } = useCreateCard(column.id);
  const { mutateAsync: updateCol } = useUpdateColumn();
  const { mutateAsync: deleteCol } = useDeleteColumn();
  const { mutateAsync: clearCards } = useClearColumncards();

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
      updateCol({ columnId: column.id, data: { name: newTitle } });
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

  const handleClearCards = async () => {
    setIsMenuOpen(false);
    try {
      await clearCards(column.id);
      setColumns((prev) =>
        prev.map((col) => (col.id === column.id ? { ...col, cards: [] } : col)),
      );
    } catch {}
  };

  const handleAddCard = async (data: AddCardFormData) => {
    await createCard({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: column.mappedStatus,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      assignees: data.assignees,
    });

    setIsAddModalOpen(false);
  };

  const handleDeleteColumn = async () => {
    setIsMenuOpen(false);

    try {
      await deleteCol(column.id);
    } catch (err: any) {
      if (err?.status === 409) {
        toast.error("Please confirm you want to delete this column.");
        setIsDeleteModalOpen(true);
        return;
      }
      toast.error(getErrorMessage(err) || "Failed to delete column");
    }
  };

  const dotColor = getColumnColor(column.name);

  if (!activeWorkspace) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex max-h-[min(680px,calc(100dvh-180px))] min-h-33 flex-col w-85 shrink-0 bg-[#111119] border border-white/5 rounded-2xl overflow-hidden shadow-sm"
    >
      <div
        {...attributes}
        {...listeners}
        className="p-4 flex items-center justify-between border-b border-white/4 cursor-grab active:cursor-grabbing hover:bg-white/2 transition-colors group shrink-0"
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
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-white/20 hover:text-white/80 p-1 rounded-md hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreHorizontal size={14} />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-[#18181B] border border-white/8 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 py-1.5">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setIsMenuOpen(false);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex items-center justify-between px-3 py-2 text-[13px] font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors w-full text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <Edit2 size={14} className="text-white/40" /> Rename column
                  </span>
                  <kbd className="hidden md:inline-flex bg-white/10 rounded px-1.5 py-0.5 text-[10px] text-white/40 font-sans">
                    R
                  </kbd>
                </button>

                {canManageWorkspace && (
                  <>
                    <div className="h-px bg-white/4 my-1.5 mx-2" />
                    <button
                      onClick={handleClearCards}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors w-full text-left"
                    >
                      <Eraser size={14} className="text-white/40" /> Clear all
                      cards
                    </button>
                    <button
                      onClick={handleDeleteColumn}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors w-full text-left"
                    >
                      <Trash2 size={14} className="text-rose-400/60" /> Delete
                      column
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-white/40 select-none shrink-0">
              {column.cards?.length || 0}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {!column.cards || column.cards?.length === 0 ? (
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
            items={(column.cards ?? []).map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3 p-3 pb-4">
              {column.cards?.map((card) => {
                const isDoneColumn =
                  column.mappedStatus?.toLowerCase() === "done" ||
                  column.name.toLowerCase().includes("done");

                return (
                  <SortableCard
                    key={card.id}
                    card={card}
                    isDone={isDoneColumn}
                    onClick={() =>
                      router.push(
                        `/${workspaceSlug}/${projectSlug}/c/${card.id}`,
                      )
                    }
                  />
                );
              })}
            </div>
          </SortableContext>
        )}
      </div>

      <div className="p-3 border-t border-white/4 shrink-0">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 text-[13px] font-semibold text-white/40 hover:text-white hover:bg-white/5 w-full px-3 py-2 rounded-lg transition-colors"
        >
          <Plus size={14} /> Add card
        </button>

        <AddCardModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          columnName={column.name}
          projectName={projectName}
          workspaceMembers={workspaceMembers}
          membersLoading={membersLoading}
          onAdd={handleAddCard}
        />

        <DeleteColumnModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          column={column}
        />
      </div>
    </div>
  );
});

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
        "flex flex-col h-max w-85 shrink-0 bg-[#16161D] rounded-2xl overflow-hidden",
        isDragging
          ? "border border-[#7C6EF5]/50 shadow-[0_0_30px_rgba(124,110,245,0.15)] scale-[1.02] opacity-90"
          : "border border-white/5",
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-white/4 bg-white/2">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-2 h-2 rounded-full", dotColor)} />
          <h3 className="text-[14px] font-bold text-white/90">{column.name}</h3>
        </div>
        <div className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-white/40">
          {column.cards.length || 0}
        </div>
      </div>
      <div className="p-6 text-center text-sm text-white/30 border-2 border-dashed border-white/10 mx-4 my-4 rounded-xl bg-white/1">
        {column.cards.length || 0} Cards inside
      </div>
    </div>
  );
}

const SortableCard = memo(function SortableCard({
  card,
  isDone,
  onClick,
}: {
  card: BoardCard;
  isDone?: boolean;
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
    filter: isDragging ? "grayscale(1)" : "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="outline-none touch-none"
    >
      <CardContent
        card={card}
        isDragging={isDragging}
        isDone={isDone}
        onClick={onClick}
      />
    </div>
  );
});

const CardContent = memo(function CardContent({
  card,
  isDragging,
  isDone,
  onClick,
}: {
  card: BoardCard;
  isDragging?: boolean;
  isDone?: boolean;
  onClick?: () => void;
}) {
  const pStyles = getPriorityStyles(card.priority);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-[#1A1A28] border rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all flex flex-col",
        isDragging
          ? "border-[#7C6EF5]/50 shadow-[0_0_30px_rgba(124,110,245,0.15)] scale-[1.02] bg-[#1F1F2E]"
          : "border-white/4 hover:border-white/10 shadow-sm",
        isDone && !isDragging && "opacity-50 hover:opacity-80",
      )}
    >
      <p
        className={cn(
          "text-[14px] font-semibold leading-snug transition-colors mb-3",
          isDone
            ? "line-through text-white/40 group-hover:text-white/60"
            : "text-white/90 group-hover:text-white",
        )}
      >
        {card.title}
      </p>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {card.priority && (
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider",
              pStyles,
            )}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            {card.priority}
          </div>
        )}

        {card.labels &&
          card.labels.map((l, i) => (
            <div
              key={i}
              className="px-2 py-0.5 rounded-[5px] text-[10px] font-semibold whitespace-nowrap"
              style={{
                color: l.colour,
                backgroundColor: l.colour + "10",
                border: `1px solid ${l.colour}15`,
              }}
            >
              {l.name}
            </div>
          ))}
      </div>

      <div className="border mb-2.5"></div>

      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-3.5 text-[11px] font-medium text-white/40">
          {card.dueDate && (
            <div className={cn("flex items-center gap-1.5")}>
              <Clock size={12} className="opacity-80" />
              {formatDateShort(card.dueDate as string)}
            </div>
          )}

          {card.commentCount !== 0 && (
            <div className="flex items-center gap-1.5 hover:text-white/70 transition-colors">
              <MessageSquare size={12} className="opacity-80" />
              {card.commentCount}
            </div>
          )}

          {card.activityCount && (
            <div className="flex items-center gap-1.5 hover:text-white/70 transition-colors">
              <Activity size={12} className="opacity-80" />
              {card.activityCount}
            </div>
          )}
        </div>

        {formatAvatarUrls(card?.assignees)}
      </div>
    </div>
  );
});
