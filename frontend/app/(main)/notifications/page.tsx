"use client";

import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notification.store";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  AtSign,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Settings,
  UserPlus,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const getTypeConfig = (type: string) => {
  switch (type) {
    case "comment_added":
      return {
        icon: MessageSquare,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
      };
    case "card_assigned":
      return {
        icon: UserPlus,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
      };
    case "card_due_soon":
      return {
        icon: Clock,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
      };
    case "mentioned":
      return {
        icon: AtSign,
        color: "text-amber-400",
        bg: "bg-amber-500/10",
      };
    default:
      return {
        icon: Mail,
        color: "text-white/50",
        bg: "bg-white/5",
      };
  }
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All types");

  const { notifications, unreadCount, markRead, markAllRead } =
    useNotificationStore();

  // Group notifications by dateGroup
  const groupedNotifications = notifications.reduce(
    (acc, notif) => {
      // Use date-fns to determine if it's Today, Yesterday, or Older
      const dateGroup = isToday(new Date(notif.createdAt))
        ? "TODAY"
        : isYesterday(new Date(notif.createdAt))
          ? "YESTERDAY"
          : "OLDER";

      if (!acc[dateGroup]) acc[dateGroup] = [];
      acc[dateGroup].push(notif);
      return acc;
    },
    {} as Record<string, typeof notifications>,
  );

  return (
    <div className="min-h-screen bg-[#0E0E12] text-white p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Notifications
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#7C6EF5]/20 text-[#B8B0FF] text-[11px] font-bold border border-[#7C6EF5]/20">
                7 unread
              </span>
            </div>
            <p className="text-white/50 text-[15px]">
              Stay on top of what&apos;s happening across your workspaces.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => markAllRead()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[13px] font-semibold transition-colors"
            >
              <Check size={14} className="text-white/70" />
              Mark all read
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[13px] font-semibold transition-colors">
              <Settings size={14} className="text-white/70" />
              Preferences
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-8 border-b border-white/10 relative">
          {["All", "Unread", "Mentions", "Preferences"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-3 text-[14px] font-semibold transition-colors relative flex items-center gap-2",
                activeTab === tab
                  ? "text-white"
                  : "text-white/50 hover:text-white/80",
              )}
            >
              {tab}
              {tab === "All" && (
                <span className="text-[11px] text-white/30">24</span>
              )}
              {tab === "Unread" && (
                <span className="text-[11px] text-[#B8B0FF]">7</span>
              )}

              {activeTab === tab && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#7C6EF5] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* FILTER CHIPS */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            "All types",
            "Comments",
            "Assignments",
            "Moves",
            "Invitations",
            "Card activity",
          ].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors flex items-center gap-2",
                activeFilter === filter
                  ? "bg-[#7C6EF5]/20 border-[#7C6EF5]/30 text-[#B8B0FF]"
                  : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10",
              )}
            >
              {/* Optional icons for specific filters based on screenshots */}
              {filter === "Comments" && <MessageSquare size={12} />}
              {filter === "Assignments" && <UserPlus size={12} />}
              {filter === "Moves" && <ArrowRight size={12} />}
              {filter === "Invitations" && <Mail size={12} />}
              {filter}
              {["Comments", "Assignments", "Invitations"].includes(filter) && (
                <span className="w-4 h-4 rounded-full bg-[#7C6EF5] text-white text-[9px] font-bold flex items-center justify-center ml-1">
                  {filter === "Comments" ? "3" : "2"}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* NOTIFICATION LIST */}
        <div className="space-y-8">
          {Object.entries(groupedNotifications).map(
            ([dateGroup, notifications]) => (
              <div key={dateGroup} className="space-y-3">
                <div className="flex items-center gap-4">
                  <h3 className="text-[11px] font-bold text-white/40 tracking-widest uppercase">
                    {dateGroup}
                  </h3>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                <div className="space-y-2.5">
                  {notifications.map((notif) => {
                    const config = getTypeConfig(notif.type);
                    const Icon = config.icon;

                    return (
                      <div
                        key={notif.id}
                        className={cn(
                          "group relative flex gap-4 p-4 rounded-xl border bg-[#15151A] transition-all hover:bg-[#1A1A22]",
                          notif.isRead
                            ? "border-white/5 opacity-70"
                            : "border-white/10 shadow-sm",
                        )}
                      >
                        {/* Left Colored Accent Border */}
                        <div
                          className={cn(
                            "absolute left-0 top-3 bottom-3 w-0.75 rounded-r-full",
                            config.bg.replace("/10", ""),
                          )}
                        />

                        {/* Icon & Avatar Stack */}
                        <div className="relative shrink-0 mt-0.5">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center border",
                              config.bg,
                              config.border,
                            )}
                          >
                            <Icon size={18} className={config.color} />
                          </div>
                          {/* Fallback "System" badge since we don't have actor initials from the DB yet */}
                          <div
                            className={cn(
                              "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#15151A] flex items-center justify-center text-[10px] font-bold text-white",
                              config.bg.replace("/10", ""),
                            )}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="text-[14px] leading-relaxed text-white/80 pr-12">
                            {/* Assuming your backend sends the full title like: "James assigned you to a card" */}
                            <span className="font-semibold text-white mr-1">
                              {notif.title}
                            </span>
                          </div>

                          {/* If there's a body (like a comment), show it as a quote */}
                          {notif.body && (
                            <div className="bg-[#0E0E12] border border-white/5 rounded-lg p-3 text-[13px] text-white/70 italic mt-2">
                              &quot;{notif.body}&quot;
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-[12px] font-medium text-white/40 pt-1">
                            <span>
                              {formatDistanceToNow(new Date(notif.createdAt))}{" "}
                              ago
                            </span>
                          </div>
                        </div>

                        {/* Right Side Actions / Unread Indicator */}
                        <div className="absolute right-4 top-4 flex items-center gap-2">
                          {/* Hover Actions */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#1A1A22] pl-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markRead(notif.id);
                              }}
                              className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-md transition-all"
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all"
                              title="Dismiss"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          {/* Unread Dot */}
                          {!notif.isRead && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#7C6EF5] group-hover:hidden shadow-[0_0_8px_rgba(124,110,245,0.6)]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
