"use client";

import BoardCanvas from "@/components/BoardCanvas";
import { useBoard } from "@/hooks/useBoard";
import { useParams, useRouter } from "next/navigation";

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();

  const workspaceId = params.workspaceId as string;
  const projectId = params.projectId as string;

  const {
    data: board,
    isLoading,
    isError,
    error,
  } = useBoard(workspaceId, projectId);

  if (error?.status === 401) {
    router.push("/workspace");
    return null;
  }

  // 3. Skeleton State
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white animate-pulse">
        {/* ... your skeleton UI ... */}
      </div>
    );
  }

  // 4. Error State
  if (isError || !board) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-gray-600">
          Something went wrong loading this board.
        </p>
        <button
          className="text-sm text-indigo-600 underline"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }

  // 5. Render

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="h-14 px-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <h1 className="font-bold text-lg text-gray-900">{board.name}</h1>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-200">
            D
          </div>
        </div>
      </header>

      <BoardCanvas
        boardId={board.id}
        workspaceId={workspaceId}
        projectId={projectId}
        initialData={board.columns}
      />
    </div>
  );
}
