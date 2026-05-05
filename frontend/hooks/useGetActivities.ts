import { api } from "@/lib/api";
import { ActivityService } from "@/services/activity.service";
import { useQuery } from "@tanstack/react-query";

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

export const useGetActivities = (
  cardId: string,
  cursor?: string,
): Promise<CardActivity[]> => {
  return useQuery({
    queryKey: ["activities", cardId, cursor],
    queryFn: () =>
      api.get(
        `/cards/${cardId}/activities${cursor ? `?cursor=${cursor}` : ""}`,
      ),
  });
};
