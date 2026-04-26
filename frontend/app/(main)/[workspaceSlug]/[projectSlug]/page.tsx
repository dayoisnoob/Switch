"use client";

import { cn } from "@/lib/utils";
import { GripHorizontal, MoreHorizontal, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { useBoard, useMoveCard, useReorderColumn } from "@/hooks/useBoard";
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

import { BoardCard, BoardColumn, BoardState } from "@/types/board.types";
import { CreateInput } from "@/components/board/CreateInput";

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
  const { projectSlug } = useParams() as {
    workspaceSlug: string;
    projectSlug: string;
  };

  const { data: project } = useProjectBySlug(projectSlug);
  const { data: board, isLoading: isBoardLoading } = useBoard(projectSlug);

  const { mutate: moveCard } = useMoveCard();
  const { mutate: reorderColumn } = useReorderColumn();

  const [columns, setColumns] = useState<BoardColumn[]>([]);

  console.log(columns);

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

      if (isActiveColumn) {
        setColumns((prev) => {
          const fromIndex = prev.findIndex((c) => c.id === activeId);
          const toIndex = prev.findIndex((c) => c.id === overId);
          const reordered = arrayMove(prev, fromIndex, toIndex);

          const prevOrder = reordered[toIndex - 1]?.order ?? 0;
          const nextOrder = reordered[toIndex + 1]?.order ?? prevOrder + 2;
          const newOrder = (prevOrder + nextOrder) / 2;

          reorderColumn(
            { columnId: activeId, order: newOrder },
            { onError: () => setColumns(prev) },
          );

          return reordered;
        });
        return;
      }

      const targetColId = targetColumnIdRef.current;
      sourceColumnIdRef.current = null;
      targetColumnIdRef.current = null;

      if (isCrossColumn) {
        setColumns((prev) => {
          const targetCol = prev.find((c) => c.id === targetColId);
          if (!targetCol) return prev;

          const cardIndex = targetCol.cards.findIndex((c) => c.id === activeId);
          const prevOrder = targetCol.cards[cardIndex - 1]?.order ?? 0;
          const nextOrder =
            targetCol.cards[cardIndex + 1]?.order ?? prevOrder + 2;
          const newOrder = (prevOrder + nextOrder) / 2;

          moveCard(
            { cardId: activeId, columnId: targetColId!, order: newOrder },
            { onError: () => setColumns(prev) },
          );

          return prev;
        });
        return;
      }

      setColumns((prev) => {
        const activeCol = findColumnInSnapshot(activeId, prev);
        const overCol = findColumnInSnapshot(overId, prev);
        if (!activeCol || !overCol) return prev;

        const fromIndex = activeCol.cards.findIndex((c) => c.id === activeId);
        const toIndex = overCol.cards.findIndex((c) => c.id === overId);
        if (fromIndex === toIndex) return prev;

        const reordered = prev.map((col) => {
          if (col.id !== activeCol.id) return col;
          return { ...col, cards: arrayMove(col.cards, fromIndex, toIndex) };
        });

        const updatedCol = reordered.find((c) => c.id === activeCol.id)!;
        const prevOrder = updatedCol.cards[toIndex - 1]?.order ?? 0;
        const nextOrder = updatedCol.cards[toIndex + 1]?.order ?? prevOrder + 2;
        const newOrder = (prevOrder + nextOrder) / 2;

        moveCard(
          { cardId: activeId, columnId: activeCol.id, order: newOrder },
          { onError: () => setColumns(prev) },
        );

        return reordered;
      });
    },
    [reorderColumn, moveCard],
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
                  <SortableColumn key={column.id} column={column}>
                    <SortableContext
                      id={column.id}
                      items={column.cards.map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-3 px-3 min-h-12.5">
                        {column.cards.map((card) => (
                          <SortableCard key={card.id} card={card} />
                        ))}
                      </div>
                    </SortableContext>
                  </SortableColumn>
                ))}

                {/* On success: append the returned column to `columns` state */}
                <CreateInput
                  isColumn
                  buttonText="Add Column"
                  placeholder="e.g. In Review"
                  onSubmit={async (title) => {
                    // Assuming you have a hook like useCreateColumn
                    // await createColumn({ projectId: project.id, name: title });
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
  children,
}: {
  column: BoardColumn;
  children: React.ReactNode;
}) {
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
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
        <div className="flex items-center gap-2">
          <GripHorizontal size={14} className="text-[#484f58] mr-1" />
          <h3 className="text-sm font-semibold text-[#f0f6fc] select-none">
            {column.name}
          </h3>
          <span className="text-xs text-[#8b949e] bg-[#1c2128] px-1.5 py-0.5 rounded-md ml-1 select-none">
            {column.cards.length}
          </span>
        </div>

        {/* TODO: onClick → open a dropdown/context menu with:
              - "Rename column"  → PATCH /projects/:projectSlug/columns/:columnId  body: { name }
              - "Delete column"  → DELETE /projects/:projectSlug/columns/:columnId
                                   On success: remove column from `columns` state
                                   Consider: warn if column has cards */}
        <button
          className="text-[#8b949e] hover:text-[#f0f6fc] p-1 rounded-md hover:bg-[#1c2128] transition-colors"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {children}

      <div className="px-3 pt-3 mt-1">
        {/* TODO: onClick → open an inline input or modal to create a card */}
        {/* TODO: POST /projects/:projectSlug/columns/:columnId/cards */}
        {/* Body: { title: string } */}
        {/* On success: append the returned card to this column's cards in `columns` state */}
        <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1c2128] rounded-md transition-colors">
          <Plus size={16} /> Add Card
        </button>
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

function SortableCard({ card }: { card: BoardCard }) {
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
      <CardContent card={card} isDragging={isDragging} />
    </div>
  );
}

function CardContent({
  card,
  isDragging,
}: {
  card: BoardCard;
  isDragging?: boolean;
}) {
  return (
    // TODO: onClick (non-drag click) → navigate to card detail or open card detail modal
    // Route suggestion: /board/:projectSlug/card/:cardId  (parallel route or modal route)
    // Make sure to suppress click during drag — check isDragging or use a pointerUp delta guard
    <div
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
