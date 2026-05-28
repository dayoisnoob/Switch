"use client";

import { Project, useDeleteProject } from "@/hooks/useProjects";
import { useWorkspaceRole, Workspace } from "@/hooks/useWorkspace";
import { getConsistentColor } from "@/lib/utils";
import {
  ChevronDown,
  Edit2,
  Filter,
  Layout,
  LayoutGrid,
  List,
  Palette,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CreateProjectModal, {
  PROJECT_ICON_MAP,
} from "../modals/CreateProjectModal";
import DeleteProjectModal from "../modals/DeleteProjectModal";
import { ProjectsSkeleton } from "../skeletons/ProjectsTab";
import EmptyProjectState from "./EmptyProjects";

interface ProjectsTab {
  workspaceSlug: string;
  workspace: Workspace;
  projects: Project[];
  projectsLoading: boolean;
  onOpenProjectModal: () => void;
}

export const ProjectsTab = ({
  workspaceSlug,
  projects,
  projectsLoading,
  onOpenProjectModal,
}: ProjectsTab) => {
  const { canManageWorkspace, isOwner } = useWorkspaceRole();

  return (
    <div>
      <>
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

        {projectsLoading ? (
          <ProjectsSkeleton />
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isOwner={isOwner}
                canManageWorkspace={canManageWorkspace}
                activeWorkspaceSlug={workspaceSlug}
                colorHash={getConsistentColor(project.id)}
              />
            ))}

            {canManageWorkspace && (
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
            )}
          </div>
        ) : (
          <div className="pt-8">
            <EmptyProjectState onCreateProject={onOpenProjectModal} />
          </div>
        )}
      </>
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  isOwner: boolean;
  canManageWorkspace: boolean;
  activeWorkspaceSlug: string;
  colorHash: string;
}

export const ProjectCard = ({
  project,
  isOwner,
  canManageWorkspace,
  activeWorkspaceSlug,
  colorHash,
}: ProjectCardProps) => {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { mutate: deleteProject, isPending } = useDeleteProject();

  const Icon = PROJECT_ICON_MAP[project.icon] || Palette;
  const progressPercent =
    project.cardsCount > 0
      ? Math.round((project.finishedCards / project.cardsCount) * 100)
      : 0;

  const handleDelete = async () => {
    if (!project.id) return;
    deleteProject({
      workspaceSlug: activeWorkspaceSlug,
      projectSlug: project.slug,
    });
  };
  return (
    <div
      onClick={() => router.push(`/${activeWorkspaceSlug}/${project.slug}`)}
      className="group/card bg-[#141419] border border-white/4 hover:border-white/10 rounded-2xl p-5 transition-all duration-300 cursor-pointer flex flex-col min-h-55 relative overflow-hidden shadow-sm hover:shadow-md"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-[14px] bg-[#7C6EF5]/10 flex items-center justify-center text-xl shrink-0">
          <Icon className="text-[#7C6EF5]" size={20} />
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-emerald-500/10 text-emerald-400">
            {project.status || "Active"}
          </span>

          {canManageWorkspace && (
            <div className="flex items-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
                className="p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/5 transition-all"
                title="Edit Project"
              >
                <Edit2 size={14} />
              </button>

              {isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-1.5 rounded-md text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  title="Delete Project"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 mt-1">
        <h3 className="text-[17px] font-semibold text-white tracking-tight mb-1.5 line-clamp-1">
          {project.name}
        </h3>
        <p className="text-[13px] text-white/40 leading-relaxed line-clamp-2 pr-4">
          {project.description || "No description provided."}
        </p>
      </div>

      <div className="mt-6">
        <div className="h-1.5 w-full bg-white/4 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: colorHash || "#7C6EF5",
            }}
          />
        </div>
        <div className="mt-2.5 text-[12px] font-medium text-white/30">
          {progressPercent}% · {project.finishedCards} of {project.cardsCount}{" "}
          cards done
        </div>
      </div>

      <div className="h-px w-full bg-white/4 my-4" />

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-4 text-[12px] font-medium text-white/40">
          <div className="flex items-center gap-1.5">
            <Layout size={14} className="text-white/30" />
            <span>{project.cardsCount || 0}</span>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex -space-x-1.5">
            {project.assignees &&
              project.assignees.slice(0, 3).map((a, i) =>
                a.avatarUrl ? (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-[#1C1C1E] bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-white z-10 overflow-hidden relative shrink-0"
                  >
                    <Image
                      src={a.avatarUrl}
                      alt={a.firstName || "User avatar"}
                      width={24}
                      height={24}
                      className="object-cover w-full h-full"
                      unoptimized
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-[#1C1C1E] bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-white z-10 shrink-0"
                  >
                    {a.firstName ? a.firstName.charAt(0).toUpperCase() : "U"}
                  </div>
                ),
              )}

            {project.assignees && project.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-[#1C1C1E] bg-[#2a2a2a] flex items-center justify-center text-[9px] font-bold text-white z-0 shrink-0">
                +{project.assignees.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      {canManageWorkspace && (
        <>
          <CreateProjectModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            project={project}
          />
          <DeleteProjectModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            project={project}
            onDelete={handleDelete}
            isDeleting={isPending}
          />
        </>
      )}
    </div>
  );
};
