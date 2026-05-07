import { api } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";

type activityTypeEnum =
  | "card_created"
  | "card_updated"
  | "card_moved"
  | "card_deleted"
  | "comment_added"
  | "comment_edited"
  | "comment_deleted"
  | "assignee_added"
  | "assignee_removed"
  | "label_added"
  | "label_removed"
  | "attachment_added"
  | "attachment_removed"
  | "due_date_set"
  | "due_date_removed"
  | "priority_changed";

export interface ActivityMetadata {
  to?: string;
  from?: string;
  columnName?: string;
  labelName?: string;
  assigneeName?: string;
  fileName?: string;
  dueDate?: string;
  priority?: string;
}

export interface CardActivity {
  id: string;
  type: activityTypeEnum;
  metadata: ActivityMetadata | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export interface ActivityPage {
  activities: CardActivity[];
  nextCursor: string | null;
}

export const useGetActivities = (cardId: string) => {
  return useInfiniteQuery<ActivityPage>({
    queryKey: ["activities", cardId],
    queryFn: ({ pageParam }): Promise<ActivityPage> =>
      api.get(
        `/cards/${cardId}/activities${pageParam ? `?cursor=${pageParam}` : ""}`,
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
  });
};
