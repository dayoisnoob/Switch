"use client";

import { getConsistentColor } from "@/lib/utils";
import { Project } from "@/services/projects.service";
import { Workspace } from "@/services/workspace.service";
import {
  ChevronDown,
  Edit2,
  Filter,
  LayoutGrid,
  List,
  Palette,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CreateProjectModal, {
  PROJECT_ICON_MAP,
} from "../modals/CreateProjectModal";

interface ProjectsTab {
  workspaceSlug: string;
  workspace: Workspace;
  projects: Project[];
  projectsLoading: boolean;
  onOpenProjectModal: () => void;
}

export const ProjectsTab = ({
  workspaceSlug,
  workspace,
  projects,
  projectsLoading,
  onOpenProjectModal,
}: ProjectsTab) => {
  return (
    <div>
      <>
        {/* SEARCH & FILTERS ROW */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1a1]"
              />
              <input
                type="text"
                placeholder="Search projects..."
                className="h-9 w-64 bg-[#1C1C1E] border border-[#2a2a2a] rounded-md pl-9 pr-4 text-sm text-white placeholder:text-[#a1a1a1] focus:outline-none focus:border-[#7C6EF5] transition-colors"
              />
            </div>
            <button className="h-9 px-3 bg-[#1C1C1E] border border-[#2a2a2a] rounded-md text-sm font-semibold text-[#a1a1a1] hover:text-white transition-colors flex items-center gap-2">
              <Filter size={14} /> Filter
            </button>
            <button className="h-9 px-3 bg-[#1C1C1E] border border-[#2a2a2a] rounded-md text-sm font-semibold text-[#a1a1a1] hover:text-white transition-colors flex items-center gap-2">
              Status <ChevronDown size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#1C1C1E] border border-[#2a2a2a] rounded-md p-1">
            <button className="w-7 h-7 rounded flex items-center justify-center bg-[#252529] text-white shadow-sm">
              <LayoutGrid size={14} />
            </button>
            <button className="w-7 h-7 rounded flex items-center justify-center text-[#a1a1a1] hover:text-white transition-colors">
              <List size={14} />
            </button>
          </div>
        </div>

        {/* PROJECT GRID */}
        {projectsLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/10 border-t-[#7C6EF5]" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                workspace={workspace}
                activeWorkspaceSlug={workspaceSlug}
                colorHash={getConsistentColor(project.id)}
              />
            ))}

            {/* "Create Project" Card (Matches the dashed card in the layout) */}
            <button
              onClick={onOpenProjectModal}
              className="bg-transparent border border-dashed border-[#333] rounded-xl p-6 hover:border-[#7C6EF5] hover:bg-[#7C6EF5]/5 transition-all flex flex-col items-center justify-center min-h-55 group"
            >
              <Plus
                size={24}
                className="text-[#a1a1a1] group-hover:text-[#7C6EF5] mb-2 transition-colors"
              />
              <span className="text-sm font-semibold text-[#a1a1a1] group-hover:text-white transition-colors">
                Create Project
              </span>
            </button>
          </div>
        ) : (
          // EMPTY STATE (Fallback if no projects at all)
          <div className="bg-[#1C1C1E] border border-dashed border-[#333] rounded-xl p-16 flex flex-col items-center text-center">
            <h4 className="text-lg font-semibold text-white mb-2">
              No projects found
            </h4>
            <p className="text-sm text-[#a1a1a1] mb-6 max-w-sm">
              Create your first project to start organizing tasks.
            </p>
            <button
              onClick={onOpenProjectModal}
              className="px-6 h-10 bg-[#3b2d9e] hover:bg-[#4a3bc2] text-white font-semibold rounded-md flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> New Project
            </button>
          </div>
        )}
      </>
    </div>
  );
};

interface ProjectCard {
  project: Project;
  workspace: Workspace;
  activeWorkspaceSlug: string;
  colorHash: string;
}

export const ProjectCard = ({
  project,
  workspace,
  activeWorkspaceSlug,
  colorHash,
}: ProjectCard) => {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Check permissions: Adjust this based on your exact user object/role structure
  const isAdminOrOwner =
    workspace.role === "Owner" || workspace.role === "Admin";

  const Icon = PROJECT_ICON_MAP[project.icon] || Palette;
  const progressPercent =
    project.cardsCount > 0
      ? Math.round((project.finishedCards / project.cardsCount) * 100)
      : 0;

  return (
    <div
      onClick={() => router.push(`/${activeWorkspaceSlug}/${project.slug}`)}
      className="group/card bg-[#1C1C1E] border border-[#2a2a2a] hover:border-[#3f3f46] rounded-2xl p-6 transition-all cursor-pointer flex flex-col min-h-60 relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="w-10 h-10 rounded-xl bg-[#252529] border border-white/5 flex items-center justify-center text-xl shadow-sm">
          <Icon />
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
            {project.status}
          </span>

          {/* Only show pencil if user has permissions */}
          {isAdminOrOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditModalOpen(true);
              }}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/20 hover:text-white hover:bg-white/10 opacity-0 group-hover/card:opacity-100 transition-all"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-bold text-white mb-2 leading-tight">
          {project.name}
        </h3>
        <p className="text-[13px] text-white/40 leading-relaxed line-clamp-2">
          {project.description || "No description provided."}
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-white/20">
          <span>Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%`, backgroundColor: colorHash }}
          />
        </div>
      </div>

      {isAdminOrOwner && (
        <CreateProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          project={project}
        />
      )}
    </div>
  );
};
