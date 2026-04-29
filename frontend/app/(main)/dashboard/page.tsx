"use client";

import { useMe } from "@/hooks/useAuth";
import { useWorkspaceStore } from "@/store/workspace.store";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  ListTodo,
  Layers,
  Users,
  Plus,
  Folder,
  ArrowUp,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: user } = useMe();
  const workspaces = useWorkspaceStore((s) => s.workspaces);

  // Helper to generate consistent colors for avatars based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-purple-500",
    ];
    const hash = name.charCodeAt(0) % colors.length;
    return colors[hash];
  };

  // ── MOCK DATA FOR VISUALS ──
  const mockActivities = [
    {
      id: 1,
      user: "James",
      initials: "JD",
      action: "moved",
      target: "Fix auth bug",
      to: "Done",
      time: "2 min ago",
      project: "API Refactor",
      color: "bg-[#7C6EF5]",
    },
    {
      id: 2,
      user: "Aisha",
      initials: "AM",
      action: "commented on",
      target: "Onboarding flow",
      time: "18 min ago",
      project: "Design System",
      color: "bg-emerald-500",
    },
    {
      id: 3,
      user: "Marcus",
      initials: "MR",
      action: "created column",
      target: "Review",
      time: "1 hr ago",
      project: "Mobile App v2",
      color: "bg-amber-500",
    },
    {
      id: 4,
      user: "Sofia",
      initials: "SL",
      action: "assigned you to",
      target: "Token refresh flow",
      time: "3 hr ago",
      project: "API Refactor",
      color: "bg-rose-500",
    },
    {
      id: 5,
      user: "Ryan",
      initials: "RK",
      action: "uploaded attachment to",
      target: "Hero design",
      time: "Yesterday",
      project: "Marketing Site",
      color: "bg-blue-500",
    },
    {
      id: 6,
      user: "Aisha",
      initials: "AM",
      action: "set priority to",
      target: "Urgent",
      to: "on DB migration",
      time: "Yesterday",
      project: "API Refactor",
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* ── HEADER ── */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Good morning, {user?.firstName || "James"} 👋
        </h1>
        <p className="text-[#a1a1a1] text-sm">
          Here's what's happening across your workspaces.
        </p>
      </header>

      {/* ── GLOBAL STATS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={<LayoutGrid size={16} className="text-[#7C6EF5]" />}
          iconBg="bg-[#7C6EF5]/10"
          title="Workspaces"
          value={workspaces.length.toString()}
          trend={1}
        />
        <StatCard
          icon={<ListTodo size={16} className="text-emerald-400" />}
          iconBg="bg-emerald-500/10"
          title="Active Projects"
          value="11"
          trend={3}
        />
        <StatCard
          icon={<Layers size={16} className="text-amber-400" />}
          iconBg="bg-amber-500/10"
          title="Open Cards"
          value="47"
          subtitle="across all boards"
        />
        <StatCard
          icon={<Users size={16} className="text-rose-400" />}
          iconBg="bg-rose-500/10"
          title="Team Members"
          value="24"
          subtitle="across workspaces"
        />
      </div>

      {/* ── MAIN CONTENT SPLIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE: Workspaces (Takes up 2 columns) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Your Workspaces</h2>
            <button className="flex items-center gap-2 bg-[#7C6EF5] hover:bg-[#6b5ed6] text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">
              <Plus size={14} /> New Workspace
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Map actual workspaces */}
            {workspaces.map((ws, i) => (
              <div
                key={ws.id}
                className="bg-[#131315] border border-[#262626] rounded-xl p-5 hover:border-[#3f3f46] transition-all group flex flex-col h-44"
              >
                <div className="flex items-start justify-between mb-auto">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                    {ws.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      i === 0
                        ? "bg-[#7C6EF5]/10 text-[#7C6EF5]"
                        : "bg-[#2a2a2a] text-[#a1a1a1]",
                    )}
                  >
                    {i === 0 ? "Owner" : "Member"}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#7C6EF5] transition-colors">
                    {ws.name}
                  </h3>
                  <p className="text-xs text-[#a1a1a1] mt-0.5">{ws.slug}</p>
                </div>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#262626]">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#a1a1a1]">
                    <Folder size={14} /> 4 projects
                  </div>

                  {/* Overlapping Avatar Mockup */}
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-2">
                      <div className="w-6 h-6 rounded-full border-2 border-[#131315] bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white">
                        J
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-[#131315] bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-white">
                        A
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-[#131315] bg-amber-500 flex items-center justify-center text-[9px] font-bold text-white">
                        M
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-[#131315] bg-[#2a2a2a] flex items-center justify-center text-[9px] font-bold text-white">
                        +5
                      </div>
                    </div>
                    <span className="text-[11px] text-[#a1a1a1]">
                      8 members
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Create Workspace Card */}
            <button className="bg-transparent border border-dashed border-[#333] rounded-xl p-5 hover:border-[#7C6EF5] hover:bg-[#7C6EF5]/5 transition-all flex flex-col items-center justify-center h-44 group">
              <Plus
                size={24}
                className="text-[#a1a1a1] group-hover:text-[#7C6EF5] mb-2 transition-colors"
              />
              <span className="text-sm font-semibold text-[#a1a1a1] group-hover:text-white transition-colors">
                Create Workspace
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Recent Activity (Takes up 1 column) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Recent Activity</h2>
          </div>

          <div className="bg-[#131315] border border-[#262626] rounded-xl overflow-hidden">
            <div className="divide-y divide-[#262626]">
              {mockActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 flex gap-3 hover:bg-[#18181b] transition-colors"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0",
                      activity.color,
                    )}
                  >
                    {activity.initials}
                  </div>
                  <div className="flex-1 min-w-0 leading-snug">
                    <p className="text-sm text-[#a1a1a1]">
                      <span className="font-semibold text-white">
                        {activity.user}
                      </span>{" "}
                      {activity.action}{" "}
                      <span className="font-semibold text-white">
                        {activity.target}
                      </span>
                      {activity.to && ` ${activity.to}`}
                    </p>
                    <p className="text-[11px] text-[#71717a] mt-1 flex items-center gap-1">
                      {activity.time} <span className="text-[#3f3f46]">•</span>{" "}
                      {activity.project}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component for the Global Stats Row
function StatCard({ icon, iconBg, title, value, trend, subtitle }: any) {
  return (
    <div className="bg-[#131315] border border-[#262626] rounded-xl p-4 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            iconBg,
          )}
        >
          {icon}
        </div>
        <span className="text-xs font-semibold text-[#a1a1a1]">{title}</span>
      </div>
      <div className="mt-auto">
        <div className="text-2xl font-black text-white">{value}</div>
        {trend ? (
          <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-[#a1a1a1]">
            <span className="flex items-center text-emerald-400 bg-emerald-400/10 px-1 rounded-sm">
              <ArrowUp size={10} className="mr-0.5" /> {trend}
            </span>
            <span>this month</span>
          </div>
        ) : (
          <div className="mt-1 text-[11px] font-medium text-[#a1a1a1]">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
