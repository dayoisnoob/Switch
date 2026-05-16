import { cn } from "@/lib/utils";

export const ActivitySkeleton = () => {
  return (
    <div className="relative space-y-6 pb-4 pt-2 animate-in fade-in duration-500">
      <div className="absolute top-4 bottom-4 left-3.75 w-px bg-white/5 pointer-events-none" />

      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4 relative z-10">
          <div className="w-8 h-8 rounded-full bg-white/5 shrink-0 mt-0.5 animate-pulse" />

          <div className="flex-1 space-y-2 pt-1.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
              <div
                className={cn(
                  "h-3 bg-white/5 rounded animate-pulse",
                  i % 2 === 0 ? "w-32" : "w-40",
                )}
              />
            </div>
            <div className="h-2.5 w-16 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};
