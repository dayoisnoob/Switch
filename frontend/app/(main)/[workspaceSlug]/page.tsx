"use client";

import CreateProjectModal, {
  PROJECT_ICON_MAP,
} from "@/components/modals/CreateProjectModal";
import { MembersTab } from "@/components/workspace/MembersTab";
import { useWorkspaceProjects } from "@/hooks/useProjects";
import { useGetMembers, useGetWorkspaces } from "@/hooks/useWorkspace";
import { cn, getConsistentColor } from "@/lib/utils";
import { Project } from "@/services/projects.service";
import {
  ChevronDown,
  Filter,
  LayoutGrid,
  List,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function WorkspacePage() {
  const router = useRouter();
  const params = useParams();

  const workspaceSlug = params?.workspaceSlug as string;

  const { data: workspaces } = useGetWorkspaces();
  const activeWorkspace = workspaces?.find((w) => w.slug === workspaceSlug);

  const [activeTab, setActiveTab] = useState("Projects");
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const { data: members = [], isLoading: membersloading } =
    useGetMembers(workspaceSlug);
  const { data: projects = [], isLoading: projectsLoading } =
    useWorkspaceProjects(workspaceSlug);

  if (!activeWorkspace) return null;

  const tabs = [{ id: "Projects" }, { id: "Members" }, { id: "Settings" }];

  if (projectsLoading || membersloading) return <div>Loading...</div>;

  return (
    <div className="max-w-300 mx-auto w-full animate-in fade-in duration-500">
      {/* ── HEADER CARD (Matches Screenshot exactly) ── */}
      <div className="bg-[#1C1C1E] border border-[#2a2a2a] rounded-xl p-5 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-12 h-12 rounded-lg  flex items-center justify-center text-xl font-black text-white shrink-0",
              activeWorkspace.colour,
            )}
          >
            {activeWorkspace.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {activeWorkspace.name}
            </h1>
            <div className="flex items-center gap-2 text-sm font-medium mt-0.5">
              <span className="text-[#a1a1a1] flex items-center gap-1.5">
                <LayoutGrid size={14} /> {projects?.length || 0} projects
              </span>
              <span className="text-[#404040]">•</span>
              <span className="text-[#a1a1a1] flex items-center gap-1.5">
                <UserPlus size={14} /> {members?.length || 0} member(s)
              </span>
              <span className="text-[#404040]">•</span>
              <span className="text-[#7C6EF5]">{activeWorkspace.role}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-9 px-4 rounded-md font-semibold text-sm text-white hover:bg-[#252529] border border-transparent transition-all flex items-center gap-2">
            <UserPlus size={16} /> Invite Member
          </button>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="h-9 px-4 bg-[#3b2d9e] hover:bg-[#4a3bc2] text-white flex items-center gap-2 rounded-md font-semibold transition-all shadow-[0_0_15px_rgba(124,110,245,0.2)]"
          >
            <Plus size={16} /> New Project
          </button>
          <button className="h-9 w-9 rounded-md flex items-center justify-center text-[#a1a1a1] hover:text-white hover:bg-[#252529] transition-all">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex items-center gap-8 border-b border-[#2a2a2a] mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3 text-sm font-semibold transition-all relative flex items-center group",
                isActive ? "text-[#7C6EF5]" : "text-[#a1a1a1] hover:text-white",
              )}
            >
              {tab.id}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C6EF5] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT: PROJECTS ── */}
      {activeTab === "Projects" && (
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
                  activeWorkspaceSlug={activeWorkspace.slug}
                  colorHash={getConsistentColor(project.id)}
                />
              ))}

              {/* "Create Project" Card (Matches the dashed card in the layout) */}
              <button
                onClick={() => setIsProjectModalOpen(true)}
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
                onClick={() => setIsProjectModalOpen(true)}
                className="px-6 h-10 bg-[#3b2d9e] hover:bg-[#4a3bc2] text-white font-semibold rounded-md flex items-center gap-2 transition-all"
              >
                <Plus size={16} /> New Project
              </button>
            </div>
          )}
        </>
      )}

      {/* ── TAB CONTENT: MEMBERS ── */}
      {activeTab === "Members" && (
        <MembersTab members={members} workspaceName={activeWorkspace.name} />
      )}

      {/* ── TAB CONTENT: SETTINGS ── */}
      {activeTab === "Settings" && (
        <div className="animate-in fade-in duration-300 max-w-2xl">
          {/* General Settings Card */}
          <div className="bg-[#1C1C1E] border border-[#2a2a2a] rounded-xl p-6 mb-6 shadow-sm">
            <h2 className="text-base font-bold text-white mb-5">General</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#a1a1a1] mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  defaultValue={activeWorkspace.name}
                  className="w-full h-10 bg-[#151517] border border-[#2a2a2a] rounded-md px-3 text-sm text-white focus:outline-none focus:border-[#7C6EF5] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#a1a1a1] mb-2">
                  Slug
                </label>
                {/* Notice the default purple border here to match the active state in your screenshot */}
                <input
                  type="text"
                  defaultValue={activeWorkspace.slug}
                  className="w-full h-10 bg-[#151517] border border-[#7C6EF5] rounded-md px-3 text-sm text-white focus:outline-none transition-colors shadow-[0_0_0_1px_rgba(124,110,245,0.2)]"
                />
              </div>

              <button className="h-9 px-4 mt-2 bg-[#7C6EF5] hover:bg-[#6b5ee6] text-white rounded-md text-sm font-semibold transition-all shadow-sm">
                Save Changes
              </button>
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="bg-[#1C1C1E] border border-red-900/50 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-red-500 mb-2">
              Danger Zone
            </h2>
            <p className="text-sm text-[#a1a1a1] mb-5">
              Deleting your workspace is permanent. All projects, boards, and
              cards will be lost.
            </p>

            <button className="h-9 px-4 bg-transparent border border-red-900/60 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 rounded-md text-sm font-semibold transition-all">
              Delete Workspace
            </button>
          </div>
        </div>
      )}

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
}

interface ProjectCard {
  project: Project;
  activeWorkspaceSlug: string;
  colorHash: string;
}

function ProjectCard({ project, activeWorkspaceSlug, colorHash }: ProjectCard) {
  const router = useRouter();
  const status = project.status;
  const totalCards = project.cardsCount || 0;
  const cardsDone = project.finishedCards || 0;
  const progressPercent =
    totalCards > 0 ? Math.round((cardsDone / totalCards) * 100) : 0;

  const Icon = PROJECT_ICON_MAP[project.icon] || "Palette";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-400";
      case "Paused":
        return "bg-amber-500/10 text-amber-400";
      case "Planning":
        return "bg-blue-500/10 text-blue-400";
      default:
        return "bg-[#2a2a2a] text-[#a1a1a1]";
    }
  };

  return (
    <div
      onClick={() => router.push(`/${activeWorkspaceSlug}/${project.slug}`)}
      className="bg-[#1C1C1E] border border-[#2a2a2a] hover:border-[#3f3f46] rounded-xl p-5 transition-all cursor-pointer flex flex-col min-h-55"
    >
      <div className="flex items-start justify-between mb-4">
        {/* Dynamic Project Icon */}
        <div className="w-8 h-8 rounded bg-[#252529] flex items-center justify-center text-lg shadow-sm">
          <Icon />
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
              getStatusColor(status),
            )}
          >
            {status}
          </span>
          <button className="text-[#a1a1a1] hover:text-white p-1 rounded hover:bg-[#252529] transition-colors">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      <div className="mb-auto">
        <h3 className="text-base font-bold text-white mb-1.5">
          {project.name}
        </h3>
        <p className="text-[13px] text-[#a1a1a1] leading-relaxed line-clamp-2">
          {project.description ||
            "Manage your team's workflow and coordinate tasks effectively within this project workspace."}
        </p>
      </div>

      {/* Progress Bar Section */}
      <div className="mt-6">
        <div className="h-1 w-full bg-[#2a2a2a] rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%`, backgroundColor: colorHash }}
          />
        </div>
        <div className="text-[11px] font-medium text-[#a1a1a1]">
          {progressPercent}% · {cardsDone} of {totalCards} cards done
        </div>
      </div>

      {/* Bottom Meta Row */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-3 text-xs font-medium text-[#a1a1a1]">
          <span className="flex items-center gap-1.5">
            <LayoutGrid size={14} /> {totalCards} cards
          </span>
        </div>

        {/* Mock Overlapping Avatars */}
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
    </div>
  );
}
