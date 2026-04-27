"use client";

import { PrimaryButton } from "@/components/auth/auth-components";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { useWorkspaceProjects } from "@/hooks/useProjects"; // Fixed import
import { cn } from "@/lib/utils";
import { ProjectType } from "@/services/projects.service";
import { useWorkspaceStore } from "@/store/workspace.store";
import { Clock, Layout } from "lucide-react"; // Added some icons for the project cards
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WorkspacePage() {
  const router = useRouter();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  const [activeTab, setActiveTab] = useState("Projects");
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const members = useWorkspaceStore((s) => s.workspaceMembers);

  const { data: projects, isLoading: projectsLoading } = useWorkspaceProjects(
    activeWorkspace?.slug,
  );

  if (!activeWorkspace) return null;

  const tabs = [
    { id: "Projects", count: projects?.length || 0, loading: projectsLoading },
    { id: "Members", count: members?.length || 0 },
  ];

  return (
    <div className="p-8 max-w-300 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#238636] rounded-lg flex items-center justify-center text-xl font-bold text-white shadow-lg">
            {activeWorkspace.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex items-center gap-2 group cursor-pointer">
            <h1 className="text-2xl font-bold text-[#f0f6fc]">
              {activeWorkspace.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PrimaryButton className="h-10 px-6 bg-[#238636] hover:bg-[#2ea043] w-auto">
            Create Project
          </PrimaryButton>
          <button className="h-10 px-4 border border-[#30363d] text-sm font-medium text-[#c9d1d9] rounded-md hover:bg-[#161b22]">
            Invite Members
          </button>
        </div>
      </div>

      {/* 2. Dynamic Tabs */}
      <div className="flex items-center gap-8 border-b border-[#30363d] mb-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-4 text-sm font-medium transition-colors relative flex items-center gap-2",
                isActive
                  ? "text-[#f0f6fc]"
                  : "text-[#8b949e] hover:text-[#c9d1d9]",
              )}
            >
              {tab.id}
              <span className="text-[10px] bg-[#1c2128] px-1.5 py-0.5 rounded-full border border-[#30363d]">
                {tab.loading ? "..." : tab.count}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#58a6ff]" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Content Routing */}
      {activeTab === "Projects" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#f0f6fc]">Projects</h3>
            <button className="text-xs text-[#8b949e] hover:text-[#58a6ff]">
              Newest First
            </button>
          </div>

          {/* Conditional Rendering: Loading -> Grid -> Empty State */}
          {projectsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#58a6ff]"></div>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project: ProjectType) => (
                <div
                  onClick={() =>
                    router.push(`/${activeWorkspace.slug}/${project.slug}`)
                  }
                  key={project.id}
                  className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 hover:border-[#58a6ff] hover:shadow-[0_0_15px_rgba(88,166,255,0.1)] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center justify-center text-[#58a6ff] group-hover:bg-[#58a6ff] group-hover:text-white transition-colors">
                      <Layout size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#f0f6fc]">
                        {project.name}
                      </h4>
                      <p className="text-[11px] text-[#8b949e]">
                        Placeholder Boards
                      </p>{" "}
                      {/* Placeholder for now */}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[#30363d] mt-2">
                    <span className="text-xs text-[#484f58] flex items-center gap-1">
                      <Clock size={12} /> Updated recently
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0d1117] border border-[#30363d] rounded-2xl p-12 flex flex-col items-center text-center">
              <div className="w-48 h-32 bg-[#161b22] border border-[#30363d] rounded-lg mb-6 flex items-center justify-center opacity-50">
                <div className="w-32 h-20 bg-[#0d1117] border border-[#30363d] rounded-sm" />
              </div>
              <h4 className="text-lg font-semibold text-[#f0f6fc] mb-2">
                No Projects Yet
              </h4>
              <p className="text-sm text-[#8b949e] mb-8 max-w-xs">
                Create a new project and start organising your cards.
              </p>
              <PrimaryButton
                onClick={() => setIsProjectModalOpen(true)}
                className="w-auto px-8 h-11 bg-[#58a6ff] hover:bg-[#4a9eff]"
              >
                Create Project
              </PrimaryButton>

              <CreateProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
              />
            </div>
          )}
        </div>
      )}

      {activeTab === "Members" && (
        <div className="py-12 text-center text-[#8b949e]">
          Members list coming soon...
        </div>
      )}
    </div>
  );
}
