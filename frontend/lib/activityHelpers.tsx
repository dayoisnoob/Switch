import {
  Activity,
  Plus,
  ArrowRightLeft,
  Tag,
  UserPlus,
  UserMinus,
  MessageSquare,
  Edit2,
  Trash2,
  Paperclip,
  Calendar,
  Flag,
  Layout,
  LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { CardActivity } from "@/services/activity.service";

export const getActivityConfig = (type: string) => {
  const config: Record<
    string,
    { icon: LucideIcon; color: string; bg: string }
  > = {
    card_created: {
      icon: Plus,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    card_updated: {
      icon: Layout,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    card_moved: {
      icon: ArrowRightLeft,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },

    // Comments
    comment_added: {
      icon: MessageSquare,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    comment_edited: {
      icon: Edit2,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    comment_deleted: {
      icon: Trash2,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },

    // Assignees
    assignee_added: {
      icon: UserPlus,
      color: "text-[#7C6EF5]",
      bg: "bg-[#7C6EF5]/10 border-[#7C6EF5]/20",
    },
    assignee_removed: {
      icon: UserMinus,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },

    // Labels
    label_added: {
      icon: Tag,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    label_removed: {
      icon: Tag,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },

    // Attachments
    attachment_added: {
      icon: Paperclip,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    attachment_removed: {
      icon: Paperclip,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },

    // Dates & Priority
    due_date_set: {
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    due_date_removed: {
      icon: Calendar,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    priority_changed: {
      icon: Flag,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  };

  // Fallback for unknown types
  return (
    config[type] || {
      icon: Activity,
      color: "text-white/50",
      bg: "bg-white/5 border-white/10",
    }
  );
};

export const renderActivityText = (activity: CardActivity) => {
  const meta = activity.metadata || {};

  switch (activity.type) {
    case "card_created":
      return "created this card";
    case "card_updated":
      return "updated the card details";
    case "card_moved":
      return meta?.from && meta?.to ? (
        <>
          moved this card from{" "}
          <span className="font-semibold text-white/80">{meta.from}</span> to{" "}
          <span className="inline-flex px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium text-xs border border-blue-500/20">
            {meta.to}
          </span>
        </>
      ) : (
        "moved this card"
      );

    case "comment_added":
      return "left a comment";
    case "comment_edited":
      return "edited their comment";
    case "comment_deleted":
      return "deleted a comment";

    case "assignee_added":
      return (
        <>
          assigned{" "}
          <span className="font-bold text-[#7C6EF5]">{meta.assigneeName}</span>{" "}
          to this card
        </>
      );

    case "assignee_removed":
      return (
        <>
          removed{" "}
          <span className="font-bold text-[#7C6EF5]">{meta.assigneeName}</span>{" "}
          from this card
        </>
      );

    case "label_added":
      return (
        <>
          attached a label:{" "}
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-md font-bold  tracking-wider bg-white/10 text-white/80">
            {meta.labelName || "label"}
          </span>{" "}
        </>
      );
    case "label_removed":
      return (
        <>
          removed a label:{" "}
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-md font-bold  tracking-wider bg-white/10 text-white/80">
            {meta.labelName || "label"}
          </span>{" "}
        </>
      );

    case "attachment_added":
      return `attached ${meta.fileName || "a file"}`;
    case "attachment_removed":
      return `removed ${meta.fileName || "an attachment"}`;

    case "due_date_set":
      const dateString = meta.dueDate
        ? format(new Date(meta.dueDate), "MMM d, yyyy")
        : "a new date";
      return `set the due date to ${dateString}`;
    case "due_date_removed":
      return "removed the due date";

    case "priority_changed":
      return `changed the priority to ${meta.priority || "a new level"}`;

    default:
      return "made an update to this card";
  }
};
