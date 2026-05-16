export const ProjectsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-[#141419] border border-white/4 rounded-2xl p-5 flex flex-col min-h-55 animate-pulse shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-[14px] bg-white/5 shrink-0" />
            <div className="w-14 h-6 rounded-md bg-white/5 shrink-0" />
          </div>

          <div className="flex-1 mt-1 space-y-2.5">
            <div className="h-5 w-3/4 bg-white/10 rounded-md" />
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-white/5 rounded" />
              <div className="h-3 w-5/6 bg-white/5 rounded" />
            </div>
          </div>

          <div className="mt-6">
            <div className="h-1.5 w-full bg-white/5 rounded-full" />
            <div className="h-3 w-32 bg-white/5 rounded mt-2.5" />
          </div>

          <div className="h-px w-full bg-white/4 my-4" />

          <div className="flex items-center justify-between mt-auto">
            <div className="h-4 w-12 bg-white/5 rounded" />
            <div className="flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-[#141419]" />
              <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-[#141419]" />
              <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-[#141419]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
