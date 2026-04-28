"use client";

import { PrimaryButton } from "@/components/auth/auth-components";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { useWorkspaceProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";
import { ProjectType } from "@/services/projects.service";
import { useWorkspaceStore } from "@/store/workspace.store";
import { Clock, Layout, Plus, FolderOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WorkspacePage() {
  const router = useRouter();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const members = useWorkspaceStore((s) => s.workspaceMembers);

  const [activeTab, setActiveTab] = useState("Projects");
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const { data: projects, isLoading: projectsLoading } = useWorkspaceProjects(
    activeWorkspace?.slug,
  );

  if (!activeWorkspace) return null;

  const tabs = [
    { id: "Projects", count: projects?.length || 0, loading: projectsLoading },
    { id: "Members", count: members?.length || 0 },
  ];

  return (
    <div className="p-8 max-w-[1200px] mx-auto w-full animate-in fade-in duration-500">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C6EF5] to-[#5D4DD1] flex items-center justify-center text-2xl font-bold text-white shadow-[0_4px_20px_rgba(124,110,245,0.3)] shrink-0">
            {activeWorkspace.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {activeWorkspace.name}
            </h1>
            <p className="text-sm text-white/40 mt-0.5 font-medium">
              Manage your workspace projects and team members.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-10 px-5 rounded-lg font-medium text-sm text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
            Invite Members
          </button>
          <PrimaryButton
            onClick={() => setIsProjectModalOpen(true)}
            className="h-10 px-5 bg-[#7C6EF5] hover:bg-[#6B5ED4] text-white flex items-center gap-2 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(124,110,245,0.2)]"
          >
            <Plus size={16} /> Create Project
          </PrimaryButton>
        </div>
      </div>

      {/* ── DYNAMIC TABS ── */}
      <div className="flex items-center gap-8 border-b border-white/5 mb-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-4 text-sm font-semibold transition-all relative flex items-center gap-2.5 group",
                isActive ? "text-white" : "text-white/40 hover:text-white/70",
              )}
            >
              {tab.id}
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full transition-colors font-mono",
                  isActive
                    ? "bg-[#7C6EF5]/10 text-[#7C6EF5]"
                    : "bg-white/5 text-white/40 group-hover:bg-white/10",
                )}
              >
                {tab.loading ? "..." : tab.count}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7C6EF5] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT: PROJECTS ── */}
      {activeTab === "Projects" && (
        <div className="space-y-6">
          {projectsLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-[#7C6EF5]" />
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project: ProjectType) => (
                <div
                  key={project.id}
                  onClick={() =>
                    router.push(`/${activeWorkspace.slug}/${project.slug}`)
                  }
                  className="bg-[#13131C]/50 hover:bg-[#1A1A28] border border-white/5 hover:border-[#7C6EF5]/40 rounded-2xl p-6 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px]"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#7C6EF5]/10 border border-[#7C6EF5]/20 flex items-center justify-center text-[#7C6EF5] group-hover:scale-105 transition-transform shrink-0">
                      <Layout size={18} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h4 className="text-base font-semibold text-white/90 truncate">
                        {project.name}
                      </h4>
                      {/* Removed the fake "Placeholder Boards" to keep it clean */}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                    <span className="text-[11px] font-medium text-white/30 flex items-center gap-1.5 uppercase tracking-wider">
                      <Clock size={11} /> Updated recently
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // ── EMPTY STATE ──
            <div className="bg-[#13131C]/30 border border-white/5 border-dashed rounded-3xl p-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mb-5">
                <FolderOpen size={32} strokeWidth={1.5} />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                No projects found
              </h4>
              <p className="text-sm text-white/40 mb-8 max-w-sm leading-relaxed">
                Projects are where your team organizes tasks and sprints. Create
                your first project to get started.
              </p>
              <PrimaryButton
                onClick={() => setIsProjectModalOpen(true)}
                className="px-6 h-11 bg-white hover:bg-white/90 text-black font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xl"
              >
                <Plus size={18} /> Create Project
              </PrimaryButton>
            </div>
          )}
        </div>
      )}

      {/* ── TAB CONTENT: MEMBERS ── */}
      {activeTab === "Members" && (
        <div className="py-24 text-center">
          <p className="text-sm text-white/30 font-medium">
            Members management coming soon.
          </p>
        </div>
      )}

      {/* ── MODALS ── */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
}
