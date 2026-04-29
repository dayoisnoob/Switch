"use client";

import { useMe, useTeammates } from "@/hooks/useAuth";
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
import { ReactNode } from "react";
import { useGetWorkspaces } from "@/hooks/useWorkspace";
import { useActiveProjectsCount } from "@/hooks/useProjects";
import { useOpenCards } from "@/hooks/board";

export default function DashboardPage() {
  const { data: user } = useMe();
  const { data: workspaces = [], isLoading: workspaceLoading } =
    useGetWorkspaces();
  const { data: projects, isLoading: countLoading } = useActiveProjectsCount();
  const { data: cards } = useOpenCards();
  const { data: teammates } = useTeammates();

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

  // ── PREMIUM SKELETON LOADER ──
  if (workspaceLoading || countLoading) {
    return (
      <div className="max-w-6xl mx-auto w-full animate-pulse">
        <div className="mb-8 space-y-3">
          <div className="h-8 w-64 bg-[#1C1C1E] rounded-md" />
          <div className="h-4 w-96 bg-[#1C1C1E] rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-[#1c1728]/50 border border-[#262626] rounded-xl p-5 h-[116px]"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-32 bg-[#1C1C1E] rounded-md" />
              <div className="h-8 w-32 bg-[#1C1C1E] rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#131315] border border-[#262626] rounded-xl h-44"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safe fallback in case workspaces is undefined after load

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      {/* ── HEADER ── */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Good morning, {user?.firstName || "James"} 👋
        </h1>
        <p className="text-[#a1a1a1] text-sm">
          Here&apos;s what&apos;s happening across your workspaces.
        </p>
      </header>

      {/* ── GLOBAL STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={<LayoutGrid size={16} className="text-[#7C6EF5]" />}
          iconBg="bg-[#7C6EF5]/10"
          title="Workspaces"
          value={workspaces.length.toString()}
        />
        <StatCard
          icon={<ListTodo size={16} className="text-emerald-400" />}
          iconBg="bg-emerald-500/10"
          title="Active Projects"
          value={projects?.count.toString()}
        />
        <StatCard
          icon={<Layers size={16} className="text-amber-400" />}
          iconBg="bg-amber-500/10"
          title="Open Cards"
          value={cards?.count.toString()}
          subtitle="across all boards"
        />
        <StatCard
          icon={<Users size={16} className="text-rose-400" />}
          iconBg="bg-rose-500/10"
          title="Team Members"
          value={teammates?.count.toString()}
          subtitle="across workspaces"
        />
      </div>

      {/* ── MAIN CONTENT SPLIT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE: Workspaces */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Your Workspaces</h2>
            <button className="flex items-center gap-2 bg-[#7C6EF5] hover:bg-[#6b5ed6] text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">
              <Plus size={14} /> New Workspace
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Map actual workspaces */}
            {workspaces.map((ws) => (
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
                      ws.role === "owner"
                        ? "bg-[#7C6EF5]/10 text-[#7C6EF5]"
                        : ws.role === "admin"
                          ? "bg-[#192d33] text-[#039752]"
                          : "bg-[#2a2a2a] text-[#a1a1a1]",
                    )}
                  >
                    {ws.role}
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
      </div>
    </div>
  );
}

// Fixed Interface
interface StatCardProps {
  icon: ReactNode; // Fixed from LucideIcon
  iconBg: string;
  title: string;
  value: string | undefined;
  subtitle?: string; // Optional
  trend?: number; // Added!
}

// Helper Component for the Global Stats Row
function StatCard({
  icon,
  iconBg,
  title,
  value,
  trend,
  subtitle,
}: StatCardProps) {
  return (
    <div className="bg-[#1c1728]/80 border border-[#262626] rounded-xl p-5 flex flex-col">
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
