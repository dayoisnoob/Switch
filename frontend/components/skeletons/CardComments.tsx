export const CommentsSkeleton = () => {
  return (
    <div className="space-y-6 py-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 animate-in fade-in duration-500">
          <div className="shrink-0 mt-0.5">
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
              <div className="h-2 w-12 bg-white/5 rounded animate-pulse" />
            </div>

            <div className="bg-[#13131A] border border-white/5 rounded-xl rounded-tl-none p-4 space-y-2">
              <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
              {i % 2 === 0 && (
                <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
