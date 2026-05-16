export const MembersSkeleton = () => {
  return (
    <div className="bg-[#13131A] border border-white/5 rounded-xl overflow-hidden shadow-xl animate-pulse">
      <div className="grid grid-cols-[2.5fr_1fr_1fr_auto] gap-4 px-6 py-3.5 border-b border-white/5 bg-white/2">
        <div className="h-3 w-16 bg-white/10 rounded" />
        <div className="h-3 w-16 bg-white/10 rounded" />
        <div className="h-3 w-12 bg-white/10 rounded" />
        <div className="w-8" />
      </div>

      <div className="flex flex-col">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="grid grid-cols-[2.5fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center border-b border-white/5 last:border-b-0"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-white/10 shrink-0" />
              <div className="flex flex-col gap-2">
                <div className="h-3.5 w-32 bg-white/10 rounded" />
                <div className="h-3 w-40 bg-white/5 rounded" />
              </div>
            </div>

            <div className="h-3.5 w-24 bg-white/5 rounded" />

            <div className="h-8 w-28 bg-white/5 rounded-md" />

            <div className="w-8 flex justify-end">
              <div className="w-6 h-6 rounded-md bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
