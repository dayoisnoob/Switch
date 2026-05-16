export const LayoutSkeleton = () => {
  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden font-sans">
      <aside className="w-65 shrink-0 bg-[#13131A] border-r border-white/5 flex flex-col">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-8 h-8 rounded-lg bg-white/8 animate-pulse" />
            <div className="h-5 w-16 bg-white/6 rounded animate-pulse" />
          </div>
          <div className="h-13 w-full bg-white/3 rounded-xl border border-white/5 animate-pulse" />
        </div>

        <div className="flex-1 px-4 py-2 space-y-1">
          <div className="h-9 w-full bg-white/3 rounded-lg animate-pulse" />
          <div className="h-9 w-full bg-white/3 rounded-lg animate-pulse" />

          <div className="pt-8 space-y-1">
            <div className="h-3 w-16 bg-white/4 rounded animate-pulse mb-3 mx-3" />
            <div className="h-8 w-full bg-white/3 rounded-lg animate-pulse" />
            <div className="h-8 w-full bg-white/3 rounded-lg animate-pulse" />
            <div className="h-8 w-3/4 bg-white/3 rounded-lg animate-pulse" />
          </div>

          <div className="pt-8 space-y-1">
            <div className="h-3 w-20 bg-white/4 rounded animate-pulse mb-3 mx-3" />
            <div className="h-8 w-full bg-white/3 rounded-lg animate-pulse" />
            <div className="h-8 w-full bg-white/3 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-white/6 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
              <div className="h-2.5 w-36 bg-white/3 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-14 shrink-0 bg-[#0A0A0A]/80 border-b border-white/5 flex items-center px-8 gap-2">
          <div className="h-3.5 w-24 bg-white/4 rounded animate-pulse" />
          <div className="h-3 w-3 bg-white/3 rounded animate-pulse" />
          <div className="h-3.5 w-20 bg-white/6 rounded animate-pulse" />
        </header>
        <main className="flex-1 bg-[#0E0E14]" />
      </div>
    </div>
  );
};

export const ProjectsListSkeleton = () => {
  return (
    <div className="space-y-0.5 animate-pulse">
      {[80, 100, 65].map((w, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-white/6 shrink-0" />
          <div className="h-3 bg-white/5 rounded" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
};
