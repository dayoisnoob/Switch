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
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PROJECT_ICON_MAP } from "../modals/CreateProjectModal";

interface ProjectsTab {
  workspaceSlug: string;
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
