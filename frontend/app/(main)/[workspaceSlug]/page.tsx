"use client";

import CreateProjectModal from "@/components/modals/CreateProjectModal";
import DeleteWorkspaceModal from "@/components/modals/DeleteWorkspaceModal";
import EmptyProjectState from "@/components/workspace/EmptyProjects";
import { MembersTab } from "@/components/workspace/MembersTab";
import { ProjectsTab } from "@/components/workspace/ProjectsTab";
import { SettingsTab } from "@/components/workspace/SettingsTab";
import { useWorkspaceProjects } from "@/hooks/useProjects";
import { useGetMembers, useGetWorkspaces } from "@/hooks/useWorkspace";
import { cn } from "@/lib/utils";
import { LayoutGrid, UserPlus } from "lucide-react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";

export default function WorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const workspaceSlug = params?.workspaceSlug as string;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const { data: workspaces } = useGetWorkspaces();
  const activeWorkspace = workspaces?.find((w) => w.slug === workspaceSlug);

  const tabParam = searchParams.get("tab") || "projects";
  const activeTab =
    tabParam.charAt(0).toUpperCase() + tabParam.slice(1).toLowerCase();

  const { data: members = [], isLoading: membersloading } =
    useGetMembers(workspaceSlug);
  const { data: projects = [], isLoading: projectsLoading } =
    useWorkspaceProjects(workspaceSlug);

  if (!activeWorkspace) return null;

  const tabs = [{ id: "Projects" }, { id: "Members" }, { id: "Settings" }];

  if (projectsLoading || membersloading) return <div>Loading...</div>;

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId.toLowerCase());

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="max-w-300 mx-auto w-full animate-in fade-in duration-500">
      {/* ── HEADER CARD ── */}
      <div className="bg-[#1C1C1E] border border-[#2a2a2a] rounded-xl p-5 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div
            style={{ backgroundColor: activeWorkspace?.colour }}
            className={cn(
              "w-12 h-12 rounded-lg  flex items-center justify-center text-xl font-black text-white shrink-0",
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
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex items-center gap-8 border-b border-[#2a2a2a] mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)} // 3. Use new handler
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
      {activeTab === "Projects" &&
        (projects.length === 0 ? (
          // Show the premium empty state if there are no projects
          <div className="pt-8">
            {" "}
            {/* Optional: add a little top padding so it doesn't hug the tabs */}
            <EmptyProjectState
              onCreateProject={() => setIsProjectModalOpen(true)}
            />
          </div>
        ) : (
          // Show the populated grid if they have projects
          <ProjectsTab
            workspaceSlug={activeWorkspace.slug}
            workspace={activeWorkspace}
            projects={projects}
            projectsLoading={projectsLoading}
            onOpenProjectModal={() => setIsProjectModalOpen(true)}
          />
        ))}

      {/* ── TAB CONTENT: MEMBERS ── */}
      {activeTab === "Members" && (
        <MembersTab members={members} activeWorkspace={activeWorkspace} />
      )}

      {/* ── TAB CONTENT: SETTINGS ── */}
      {activeTab === "Settings" && (
        <SettingsTab
          activeWorkspace={activeWorkspace}
          onOpenDeleteModal={() => setIsDeleteModalOpen(true)}
        />
      )}

      {/* ── MODALS ── */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
      <DeleteWorkspaceModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        workspace={activeWorkspace}
        projectCount={projects?.length || 0}
        memberCount={members?.length || 0}
      />
    </div>
  );
}
