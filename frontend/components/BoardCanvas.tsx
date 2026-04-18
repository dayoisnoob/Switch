"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { FiPlus, FiMoreHorizontal } from "react-icons/fi";
import { Column } from "@/types/board";
import CreateTaskModal from "./CreateTaskModal";

interface BoardCanvasProps {
  boardId: string;
  workspaceId: string;
  projectId: string;
  initialData: Column[];
}

export default function BoardCanvas({
  boardId,
  workspaceId,
  projectId,
  initialData,
}: BoardCanvasProps) {
  const [columns, setColumns] = useState<Column[]>(initialData || []);

  useEffect(() => {
    setColumns(initialData);
  }, [initialData]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    console.log("dest", destination);
    console.log("source", source);
    console.log("drag", draggableId);

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newColumns = Array.from(columns);

    const sourceColIndex = newColumns.findIndex(
      (col) => col.id === source.droppableId,
    );
    const destColIndex = newColumns.findIndex(
      (col) => col.id === destination.droppableId,
    );

    const sourceCol = newColumns[sourceColIndex];
    const destCol = newColumns[destColIndex];

    const [movedTask] = sourceCol.tasks.splice(source.index, 1);

    destCol.tasks.splice(destination.index, 0, movedTask);

    const destTasks = destCol.tasks;
    let newOrder = 1000;

    if (destTasks.length === 1) {
      newOrder = 1000;
    } else if (destination.index === 0) {
      newOrder = destTasks[1].order / 2;
    } else if (destination.index === destTasks.length - 1) {
      newOrder = destTasks[destTasks.length - 2].order + 1000;
    } else {
      const prevOrder = destTasks[destination.index - 1].order;
      const nextOrder = destTasks[destination.index + 1].order;
      newOrder = (prevOrder + nextOrder) / 2;
    }

    movedTask.order = newOrder;

    setColumns(newColumns);

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/tasks/${draggableId}/position`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          columnId: destination.droppableId,
          order: newOrder,
        }),
      });

      if (!res.ok) {
        console.error("Backend failed to save the new position.");
      }
    } catch (error) {
      console.error("Network error saving position:", error);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full items-start gap-6 p-6">
          {columns.map((column) => (
            <div
              key={column.id}
              className="w-[320px] flex-shrink-0 flex flex-col max-h-full bg-gray-50 border border-gray-200 rounded-xl"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-gray-800">
                    {column.name}
                  </h3>
                  <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {column.tasks?.length || 0}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <FiMoreHorizontal />
                </button>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar ${snapshot.isDraggingOver ? "bg-gray-100" : ""}`}
                  >
                    {column.tasks?.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-3 rounded-lg border shadow-sm transition-all ${
                              snapshot.isDragging
                                ? "border-gray-900 shadow-lg scale-105 rotate-1"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <p className="text-sm text-gray-900">
                              {task.title}
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <div className="p-2 border-t border-gray-200">
                <CreateTaskModal
                  workspaceId={workspaceId}
                  projectId={projectId}
                  boardId={boardId}
                  columnId={column.id}
                  columnName={column.name}
                />
              </div>
            </div>
          ))}

          <button className="w-[320px] flex-shrink-0 flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            <FiPlus /> Add another list
          </button>
        </div>
      </div>
    </DragDropContext>
  );
}
