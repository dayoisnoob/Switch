import { Flag } from "lucide-react";

export const PRIORITY_COLOR: Record<string, string> = {
  urgent: "text-red-400",
  high: "text-orange-400",
  medium: "text-yellow-400",
  low: "text-blue-400",
  none: "text-white/40",
};

export const PRIORITY_OPTIONS = [
  { label: "No Priority", value: "none", icon: <Flag size={13} /> },
  {
    label: "Low",
    value: "low",
    icon: <Flag size={13} />,
    colorClass: "text-blue-400",
  },
  {
    label: "Medium",
    value: "medium",
    icon: <Flag size={13} />,
    colorClass: "text-yellow-400",
  },
  {
    label: "High",
    value: "high",
    icon: <Flag size={13} />,
    colorClass: "text-orange-400",
  },
  {
    label: "Urgent",
    value: "urgent",
    icon: <Flag size={13} />,
    colorClass: "text-red-400",
  },
];
