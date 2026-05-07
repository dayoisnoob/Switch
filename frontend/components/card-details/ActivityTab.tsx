"use client";

import { ActivityPage, useGetActivities } from "@/hooks/useActivities";
import { getActivityConfig, renderActivityText } from "@/lib/activityHelpers";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

export function ActivityTab({ cardId }: { cardId: string }) {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetActivities(cardId);

  const allActivities = data?.pages.flatMap((p) => p.activities) ?? [];

  if (isLoading && allActivities.length === 0) {
    return (
      <div className="py-8 flex justify-center">
        <div className="w-5 h-5 border-2 border-[#7C6EF5]/30 border-t-[#7C6EF5] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative space-y-6 pb-4 pt-2">
      {allActivities.length > 0 && (
        <div className="absolute top-4 bottom-4 left-3.75 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent pointer-events-none" />
      )}

      {allActivities.length > 0 ? (
        <>
          {allActivities.map((activity) => {
            const { icon: Icon, color, bg } = getActivityConfig(activity.type);
            return (
              <div key={activity.id} className="flex gap-4 relative z-10 group">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5 shadow-sm",
                    bg,
                  )}
                >
                  <Icon size={14} className={color} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-[13px] text-white/70 leading-relaxed">
                    <span className="font-bold text-white/90">
                      {activity.user?.firstName} {activity.user?.lastName}
                    </span>{" "}
                    {renderActivityText(activity)}
                  </div>
                  <div className="text-[11px] font-medium text-white/30">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full text-[12px] text-white/40 hover:text-white/60 py-2 transition-colors disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading..." : "Load more activity"}
            </button>
          )}

          {!hasNextPage && (
            <p className="text-center text-[11px] text-white/20 py-2">
              No more activity
            </p>
          )}
        </>
      ) : (
        <div className="py-10 text-center border-2 border-white/5 border-dashed rounded-xl bg-white/1">
          <p className="text-[13px] text-white/40 font-medium">
            No activity logged yet.
          </p>
        </div>
      )}
    </div>
  );
}
