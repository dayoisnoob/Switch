export function WorkspaceSkeleton() {
  return (
    <div className="max-w-300 mx-auto w-full animate-in fade-in duration-500">
      <div className="bg-[#1C1C1E] border border-[#2a2a2a] rounded-xl p-5 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 w-full">
          <div className="w-12 h-12 rounded-lg bg-[#2a2a2a] animate-pulse shrink-0" />
          <div className="flex flex-col gap-2 w-full">
            <div className="h-6 w-48 bg-[#2a2a2a] rounded-md animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-[#2a2a2a] rounded flex items-center animate-pulse" />
              <span className="text-[#404040]">•</span>
              <div className="h-4 w-28 bg-[#2a2a2a] rounded flex items-center animate-pulse" />
              <span className="text-[#404040]">•</span>
              <div className="h-4 w-16 bg-[#2a2a2a] rounded flex items-center animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8 border-b border-[#2a2a2a] mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="pb-3 flex items-center">
            <div className="h-5 w-16 bg-[#2a2a2a] rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-35 bg-[#1C1C1E] border border-[#2a2a2a] rounded-xl p-5 flex flex-col justify-between animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#2a2a2a]" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-4 w-24 bg-[#2a2a2a] rounded" />
                  <div className="h-3 w-16 bg-[#2a2a2a] rounded" />
                </div>
              </div>
              <div className="w-6 h-6 rounded bg-[#2a2a2a]" />
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2a2a2a]">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#3a3a3a] border-2 border-[#1C1C1E]" />
                <div className="w-6 h-6 rounded-full bg-[#3a3a3a] border-2 border-[#1C1C1E]" />
              </div>
              <div className="h-3 w-20 bg-[#2a2a2a] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
