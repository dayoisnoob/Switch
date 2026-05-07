"use client";

import CreateWorkspaceModal from "@/components/modals/CreateWorkspaceModal";
import EmptyWorkspaceState from "@/components/workspace/EmptyWorkspace";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { useMe, useTeammates } from "@/hooks/useAuth";
import { useOpenCards } from "@/hooks/useCards";
import { useActiveProjectsCount } from "@/hooks/useProjects";
import { useGetWorkspaces } from "@/hooks/useWorkspace";
import { cn } from "@/lib/utils";
import { Workspace } from "@/services/workspace.service";
import { useWorkspaceStore } from "@/store/workspace.store";
import {
  ArrowUp,
  Layers,
  LayoutGrid,
  ListTodo,
  Plus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [isAddWorkspaceOpen, setIsAddWorkspaceOpen] = useState(false);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  const { data: user } = useMe();
  const { data: cards } = useOpenCards();
  const { data: teammates } = useTeammates();
  const { data: projects, isLoading: countLoading } = useActiveProjectsCount();
  const { data: workspaces = [], isFetched } = useGetWorkspaces();

  const handleRedirectWorkspace = (ws: Workspace) => {
    setActiveWorkspace(ws);
    router.push(`/${ws.slug}`);
  };

  if (!isFetched || countLoading) {
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
              className="bg-[#1c1728]/50 border border-[#262626] rounded-xl p-5 h-29"
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

  return (
    <>
      <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-500">
        {workspaces.length === 0 ? (
          // ── EMPTY STATE (Hides everything else) ──
          <EmptyWorkspaceState
            onCreateWorkspace={() => setIsAddWorkspaceOpen(true)}
          />
        ) : (
          // ── POPULATED STATE ──
          <>
            {/* ── HEADER ── */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Good morning, {user?.firstName || "James"} 👋
              </h1>
              <p className="text-white/40 text-[13px]">
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
                  <h2 className="text-[13px] font-bold text-white/90 uppercase tracking-wider">
                    Your Workspaces
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workspaces.map((ws) => (
                    <WorkspaceCard
                      key={ws.id}
                      ws={ws}
                      handleRedirectWorkspace={() =>
                        handleRedirectWorkspace(ws)
                      }
                    />
                  ))}

                  {/* Premium "Create Workspace" Card */}
                  <button
                    onClick={() => setIsAddWorkspaceOpen(true)}
                    className="bg-white/1 border border-dashed border-white/10 rounded-xl p-5 hover:border-white/20 hover:bg-white/3 transition-all flex flex-col items-center justify-center h-[200px] group"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/3 flex items-center justify-center mb-3 group-hover:bg-[#7C6EF5]/10 group-hover:scale-110 transition-all duration-300">
                      <Plus
                        size={20}
                        className="text-white/40 group-hover:text-[#7C6EF5] transition-colors"
                      />
                    </div>
                    <span className="text-[13px] font-semibold text-white/40 group-hover:text-white/80 transition-colors">
                      Create Workspace
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Modal sits outside the conditional so it can be opened from anywhere */}
      <CreateWorkspaceModal
        isOpen={isAddWorkspaceOpen}
        onClose={() => setIsAddWorkspaceOpen(false)}
      />
    </>
  );
}

// Fixed Interface
interface StatCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  value: string | undefined;
  subtitle?: string;
  trend?: number;
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
    <div className="bg-white/2 border border-white/5 rounded-xl p-5 flex flex-col hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            iconBg,
          )}
        >
          {icon}
        </div>
        <span className="text-xs font-semibold text-white/40">{title}</span>
      </div>
      <div className="mt-auto">
        <div className="text-2xl font-black text-white/90">{value || "0"}</div>
        {trend ? (
          <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-white/40">
            <span className="flex items-center text-emerald-400 bg-emerald-400/10 px-1 rounded-sm">
              <ArrowUp size={10} className="mr-0.5" /> {trend}
            </span>
            <span>this month</span>
          </div>
        ) : (
          <div className="mt-1 text-[11px] font-medium text-white/30">
            {subtitle || "Total"}
          </div>
        )}
      </div>
    </div>
  );
}
