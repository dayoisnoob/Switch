import { ActivityService } from "@/services/activity.service";
import { useQuery } from "@tanstack/react-query";

export const useGetActivities = (cardId: string) => {
  return useQuery({
    queryKey: ["activities", cardId],
    queryFn: () => ActivityService.fetchLogs(cardId),
  });
};
