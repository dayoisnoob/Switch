import { useGetActivities } from "@/hooks/useGetActivities";
import { getActivityConfig, renderActivityText } from "@/lib/activityHelpers";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function ActivityTab({ cardId }: { cardId: string }) {
  // Use your actual data hook here!
  const { data: activities = [], isLoading } = useGetActivities(cardId);

  console.log(activities);

  return (
    <div className="relative space-y-6 pb-4 pt-2">
      <div className="absolute top-2 bottom-2 left-[15px] w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

      {activities.length > 0 ? (
        activities.map((activity) => {
          const { icon: Icon, color, bg } = getActivityConfig(activity.type);

          return (
            <div
              key={activity.id}
              className="flex gap-4 relative z-10 group animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                  bg,
                )}
              >
                <Icon size={14} className={color} />
              </div>

              <div className="flex-1 space-y-1">
                <div className="text-sm text-white/60 leading-relaxed">
                  <span className="font-semibold text-white/90">
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
        })
      ) : (
        <div className="py-8 text-center border border-white/5 border-dashed rounded-xl bg-white/[0.02]">
          <p className="text-sm text-white/30 font-medium">
            No activity logged yet.
          </p>
        </div>
      )}
    </div>
  );
}
