export function KanbanBoardSkeleton() {
  const skeletonColumns = [
    { cards: 3 },
    { cards: 5 },
    { cards: 2 },
    { cards: 4 },
  ];

  return (
    <div className="flex gap-6 items-start w-max min-h-0 pb-2">
      {skeletonColumns.map((col, index) => (
        <div
          key={index}
          className="w-85 shrink-0 bg-white/2 border border-white/5 rounded-2xl p-3 flex flex-col gap-3 animate-in fade-in duration-500"
        >
          <div className="flex items-center justify-between px-1 mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/10 animate-pulse" />
              <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-6 bg-white/5 rounded animate-pulse ml-1" />
            </div>
            <div className="w-6 h-6 rounded bg-white/5 animate-pulse" />
          </div>

          {Array.from({ length: col.cards }).map((_, cardIndex) => (
            <div
              key={cardIndex}
              className="bg-[#13131A] border border-white/5 rounded-xl p-3.5 flex flex-col gap-3 shadow-sm"
            >
              <div className="flex gap-1.5">
                <div className="h-1.5 w-8 bg-white/10 rounded-full animate-pulse" />
                {cardIndex % 2 === 0 && (
                  <div className="h-1.5 w-12 bg-white/10 rounded-full animate-pulse" />
                )}
              </div>

              <div className="space-y-2 mt-1">
                <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse" />
              </div>

              <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="h-3.5 w-14 bg-white/5 rounded-md animate-pulse" />
                  <div className="h-3.5 w-8 bg-white/5 rounded-md animate-pulse" />
                </div>

                <div className="flex -space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-white/10 border-2 border-[#13131A] animate-pulse" />
                  {cardIndex % 3 !== 0 && (
                    <div className="w-5 h-5 rounded-full bg-white/10 border-2 border-[#13131A] animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
