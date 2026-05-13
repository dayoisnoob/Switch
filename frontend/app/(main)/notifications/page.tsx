"use client";

import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notification.store";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import {
  ArrowRight,
  AtSign,
  BellOff,
  Check,
  Clock,
  Mail,
  MessageSquare,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";

const getTypeConfig = (type: string) => {
  switch (type) {
    case "comment_added":
      return {
        icon: MessageSquare,
        color: "text-[#38bdf8]",
        bg: "bg-[#38bdf8]/10",
      };
    case "card_assigned":
      return {
        icon: UserPlus,
        color: "text-[#34d399]",
        bg: "bg-[#34d399]/10",
      };
    case "card_due_soon":
      return {
        icon: Clock,
        color: "text-[#fbbf24]",
        bg: "bg-[#fbbf24]/10",
      };
    case "mentioned":
      return {
        icon: AtSign,
        color: "text-[#fb7185]",
        bg: "bg-[#fb7185]/10",
      };

    case "invitation":
      return {
        icon: Mail,
        color: "text-[#818cf8]",
        bg: "bg-[#818cf8]/10",
      };
    default:
      return {
        icon: Mail,
        color: "text-white/40",
        bg: "bg-white/5",
      };
  }
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [activeFilter, setActiveFilter] = useState("All types");

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  const filteredNotifications = notifications.filter((notif) => {
    // 1. Apply Top Navigation Tab Filter
    if (activeTab === "Unread" && notif.isRead) return false;
    if (activeTab === "Mentions" && notif.type !== "mentioned") return false;

    // 2. Apply Sub-filter Chips
    if (activeFilter === "Comments" && notif.type !== "comment_added")
      return false;
    if (activeFilter === "Assignments" && notif.type !== "card_assigned")
      return false;
    if (activeFilter === "Invitations" && notif.type !== "invitation")
      return false;

    return true;
  });

  // Group the *filtered* notifications by dateGroup
  const groupedNotifications = filteredNotifications.reduce(
    (acc, notif) => {
      const date = new Date(notif.createdAt);
      const dateGroup = isToday(date)
        ? "Today"
        : isYesterday(date)
          ? "Yesterday"
          : "Older";

      if (!acc[dateGroup]) acc[dateGroup] = [];
      acc[dateGroup].push(notif);
      return acc;
    },
    {} as Record<string, typeof notifications>,
  );

  return (
    <div className="min-h-screen w-full text-white font-sans pb-20">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* ── HEADER ── */}
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white/90">
                Inbox
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-[#7C6EF5]/10 text-[#7C6EF5] text-[11px] font-bold tracking-wide">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-white/40 text-[14px]">
              Catch up on the latest activity across your projects.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => markAllRead()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-[12px] font-semibold text-white/70 hover:text-white transition-all shadow-sm"
            >
              <Check size={14} className="text-white/40" />
              Mark all as read
            </button>
          </div>
        </div>

        {/* ── NAVIGATION TABS ── */}
        <div className="flex items-center gap-8 border-b border-white/10 relative">
          {["All", "Unread", "Mentions"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setActiveFilter("All types"); // Reset chip filter when changing main tabs
              }}
              className={cn(
                "pb-3 text-[13px] font-semibold transition-colors relative flex items-center gap-2",
                activeTab === tab
                  ? "text-white"
                  : "text-white/40 hover:text-white/70",
              )}
            >
              {tab}
              {tab === "Unread" && unreadCount > 0 && (
                <span className="text-[11px] text-[#7C6EF5] font-bold">
                  {unreadCount}
                </span>
              )}

              {activeTab === tab && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#7C6EF5] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* ── FILTER CHIPS ── */}
        <div className="flex flex-wrap items-center gap-2">
          {["All types", "Comments", "Assignments", "Invitations"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-2",
                  activeFilter === filter
                    ? "bg-white/10 text-white shadow-sm"
                    : "bg-transparent text-white/40 hover:text-white/80 hover:bg-white/5",
                )}
              >
                {filter === "Comments" && (
                  <MessageSquare size={12} className="opacity-50" />
                )}
                {filter === "Assignments" && (
                  <UserPlus size={12} className="opacity-50" />
                )}

                {filter === "Invitations" && (
                  <Mail size={12} className="opacity-50" />
                )}
                {filter}
              </button>
            ),
          )}
        </div>

        {/* ── NOTIFICATION LIST & EMPTY STATE ── */}
        <div className="space-y-10">
          {filteredNotifications.length === 0 ? (
            /* 🌟 NEW: Premium Empty State */
            <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                <BellOff size={28} className="text-white/20" />
              </div>
              <h3 className="text-[15px] font-bold text-white/90 mb-1.5">
                All caught up
              </h3>
              <p className="text-[13px] text-white/40 max-w-[260px]">
                You have no notifications matching this filter. Check back later
                for updates.
              </p>
              {(activeTab !== "All" || activeFilter !== "All types") && (
                <button
                  onClick={() => {
                    setActiveTab("All");
                    setActiveFilter("All types");
                  }}
                  className="mt-6 text-[13px] font-semibold text-[#7C6EF5] hover:text-[#B8B0FF] transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            Object.entries(groupedNotifications).map(
              ([dateGroup, groupNotifications]) => (
                <div
                  key={dateGroup}
                  className="space-y-4 animate-in fade-in duration-300"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-[10px] font-bold text-white/30 tracking-widest uppercase">
                      {dateGroup}
                    </h3>
                  </div>

                  <div className="space-y-1.5">
                    {groupNotifications.map((notif) => {
                      const config = getTypeConfig(notif.type);
                      const Icon = config.icon;

                      return (
                        <div
                          key={notif.id}
                          className={cn(
                            "group relative flex items-start gap-4 p-4 rounded-xl transition-all duration-200",
                            notif.isRead
                              ? "bg-transparent hover:bg-white/[0.02] opacity-70 hover:opacity-100"
                              : "bg-[#13131A] border border-white/5 shadow-xl shadow-black/20",
                          )}
                        >
                          {/* Icon Stack */}
                          <div className="relative shrink-0 mt-0.5">
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center",
                                config.bg,
                              )}
                            >
                              <Icon size={16} className={config.color} />
                            </div>

                            {/* Fallback "System" badge */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#1A1A24] border-2 border-[#13131A] flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                            </div>
                          </div>

                          {/* Content Area */}
                          <div className="flex-1 min-w-0 pr-12">
                            <div className="text-[13px] leading-relaxed text-white/60">
                              <span
                                className={cn(
                                  "mr-1",
                                  notif.isRead
                                    ? "font-medium text-white/80"
                                    : "font-semibold text-white/90",
                                )}
                              >
                                {notif.title}
                              </span>
                            </div>

                            {/* Quote Body */}
                            {notif.body && (
                              <div className="mt-2 text-[13px] text-white/50 line-clamp-2 border-l-2 border-white/10 pl-3 py-0.5">
                                {notif.body}
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-[11px] font-medium text-white/30 pt-2">
                              {formatDistanceToNow(new Date(notif.createdAt))}{" "}
                              ago
                            </div>
                          </div>

                          {/* Right Side Actions & Unread Indicator */}
                          <div className="absolute right-4 top-4 flex items-center gap-2">
                            {/* Hover Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#13131A] pl-2">
                              {!notif.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markRead(notif.id);
                                  }}
                                  className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                  title="Mark as read"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                            </div>

                            {/* Unread Dot */}
                            {!notif.isRead && (
                              <div className="w-2 h-2 rounded-full bg-[#7C6EF5] group-hover:opacity-0 transition-opacity" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ),
            )
          )}
        </div>
      </div>
    </div>
  );
}
