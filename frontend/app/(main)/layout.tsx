"use client";

import CreateWorkspaceModal from "@/components/modals/AddWorkspaceModal";
import WorkspaceSwitcherModal from "@/components/modals/SwitchWorkspaceModal";
import { useLogout, useMe } from "@/hooks/useAuth";
import { useWorkspaceProjects } from "@/hooks/useProjects";
import { useGetMembers, useGetWorkspaces } from "@/hooks/useWorkspace";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace.store";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  LogOut,
  Package,
  Plus,
  Search,
  Settings,
  Settings2Icon,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string;

  const [isAddWorkspaceOpen, setIsAddWorkspaceOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  const logout = useLogout();
  const { data: user, isLoading: userLoading } = useMe();
  const { data: workspaces = [], isLoading: workspacesLoading } =
    useGetWorkspaces();
  const { data: projects = [], isLoading: projectsLoading } =
    useWorkspaceProjects(workspaceSlug);

  useEffect(() => {
    if (workspaces && workspaces.length > 0) {
      if (workspaceSlug) {
        const matchedWorkspace = workspaces.find(
          (w) => w.slug === workspaceSlug,
        );

        if (
          matchedWorkspace &&
          matchedWorkspace.slug !== activeWorkspace?.slug
        ) {
          setActiveWorkspace(matchedWorkspace);
        }
      } else if (!activeWorkspace) {
        setActiveWorkspace(workspaces[0]);
      }
    }
  }, [
    workspaces,
    workspaceSlug,
    activeWorkspace?.slug,
    setActiveWorkspace,
    activeWorkspace,
  ]);

  const { data: members = [], isLoading: membersLoading } = useGetMembers(
    activeWorkspace?.slug,
  );

  // ── PREMIUM LOADING SKELETON ──
  if (workspacesLoading || userLoading || projectsLoading || membersLoading) {
    return (
      <div className="flex h-screen bg-[#0A0A0A] overflow-hidden font-sans">
        <aside className="w-64 shrink-0 bg-[#0A0A0A] border-r border-white/[0.05] flex flex-col">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] animate-pulse" />
              <div className="h-5 w-16 bg-white/[0.05] rounded animate-pulse" />
            </div>
            <div className="h-14 w-full bg-white/[0.02] rounded-xl border border-white/[0.05] animate-pulse" />
          </div>
          <div className="flex-1 px-4 py-4 space-y-8">
            <div className="space-y-2 animate-pulse">
              <div className="h-9 w-full bg-white/[0.03] rounded-md" />
              <div className="h-9 w-full bg-white/[0.03] rounded-md" />
            </div>
          </div>
        </aside>
        <div className="flex flex-col flex-1 min-w-0">
          <header className="h-14 shrink-0 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/[0.05] flex items-center px-8" />
          <main className="flex-1 bg-[#0A0A0A] p-12">
            <div className="max-w-6xl mx-auto w-full animate-pulse space-y-6 opacity-30">
              <div className="h-8 w-64 bg-white/[0.05] rounded-md" />
              <div className="h-4 w-96 bg-white/[0.05] rounded-md" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  const PROJECT_COLORS = [
    "#38bdf8",
    "#818cf8",
    "#a855f7",
    "#fb7185",
    "#fbbf24",
    "#34d399",
  ];

  const getConsistentColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PROJECT_COLORS.length;
    return PROJECT_COLORS[index];
  };

  const mainNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
      count: 4,
    },
  ];

  const workspaceSettingsNavItems = [
    {
      name: "Projects",
      href: `/${activeWorkspace?.slug}?tab=projects`,
      icon: Package,
      count: projects?.length,
    },
    {
      name: "Members",
      href: `/${activeWorkspace?.slug}?tab=members`,
      icon: Users,
      count: members.length,
    },
    {
      name: "Settings",
      href: `/${activeWorkspace?.slug}?tab=settings`,
      icon: Settings2Icon,
    },
  ];

  const getInitials = (wsName: string) => {
    return wsName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden text-[#A1A1AA] font-sans selection:bg-[#7C6EF5]/30">
      {/* ── SIDEBAR ── */}
      <aside className="w-64 shrink-0 bg-[#0A0A0A] border-r border-white/[0.05] flex flex-col z-20">
        {/* Workspace Switcher */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7C6EF5] to-[#a89bf8] flex items-center justify-center text-white text-sm font-black shadow-[0_0_15px_rgba(124,110,245,0.4)]">
              S
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Switch
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className={cn(
                "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 border",
                isSwitcherOpen
                  ? "bg-white/[0.05] border-white/[0.1] shadow-sm"
                  : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08]",
              )}
            >
              <div
                className="w-8 h-8 shrink-0 rounded-lg overflow-hidden flex items-center justify-center text-white text-[11px] font-black shadow-inner"
                style={{ backgroundColor: activeWorkspace?.colour }}
              >
                {activeWorkspace?.name
                  ? getInitials(activeWorkspace.name)
                  : "AC"}
              </div>

              <div className="flex flex-col items-start overflow-hidden flex-1">
                <span className="text-[13px] font-semibold text-white/90 truncate w-full text-left">
                  {activeWorkspace?.name}
                </span>
                <span className="text-[10px] font-medium text-[#7C6EF5] mt-0.5">
                  Workspace Owner
                </span>
              </div>

              <ChevronDown
                size={14}
                className={cn(
                  "text-white/40 shrink-0 ml-auto transition-transform duration-200 ease-out",
                  isSwitcherOpen && "rotate-180 text-white/80",
                )}
              />
            </button>
          </div>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 px-4 space-y-1 py-2 custom-scrollbar overflow-y-auto">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white",
                )}
              >
                <item.icon
                  size={16}
                  className={cn(
                    "transition-colors duration-200",
                    isActive
                      ? "text-white"
                      : "text-white/40 group-hover:text-white/80",
                  )}
                />
                {item.name}
                {item.count && (
                  <div className="ml-auto flex items-center justify-center px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-white/70 min-w-5 border border-white/[0.05]">
                    {item.count}
                  </div>
                )}
              </Link>
            );
          })}

          {/* Projects */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2 px-3">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Projects
              </span>
              <button className="text-white/40 hover:text-white transition-colors">
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-0.5">
              {projects.map((proj) => {
                const dynamicColor = getConsistentColor(proj.id);
                return (
                  <Link
                    key={proj.id}
                    href={`/dashboard/projects/${proj.id}`}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-white/60 hover:bg-white/[0.04] hover:text-white rounded-lg transition-colors group"
                  >
                    <div
                      className="w-2 h-2 rounded-full transition-transform duration-200 group-hover:scale-125"
                      style={{
                        backgroundColor: dynamicColor,
                        boxShadow: `0 0 8px ${dynamicColor}40`,
                      }}
                    />
                    <span className="truncate">{proj.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Workspace Settings */}
          <div className="mt-8">
            <div className="flex items-center mb-2 px-3">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Workspace
              </span>
            </div>
            <div className="space-y-0.5">
              {workspaceSettingsNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-white/60 hover:bg-white/[0.04] hover:text-white rounded-lg transition-colors group"
                >
                  <item.icon
                    size={16}
                    className="text-white/40 group-hover:text-white/80 transition-colors"
                  />
                  {item.name}
                  <div className="ml-auto flex items-center justify-center px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-white/70 min-w-5 border border-white/[0.05]">
                    {item.count}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* ── USER PROFILE DROP-UP ── */}
        <div className="p-4 mt-auto relative">
          {isUserDropdownOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsUserDropdownOpen(false)}
            />
          )}

          {isUserDropdownOpen && (
            <div className="absolute bottom-[calc(100%-8px)] left-4 right-4 bg-[#121212]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-[0_-8px_30px_rgb(0,0,0,0.5)] z-50 overflow-hidden flex flex-col p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Link
                href="/dashboard/settings"
                onClick={() => setIsUserDropdownOpen(false)}
                className="w-full flex items-center gap-3 p-2.5 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
              >
                <Settings size={15} />
                <span>Account Settings</span>
              </Link>
              <div className="h-px bg-white/[0.05] my-1 mx-1" />
              <button
                onClick={() => {
                  setIsUserDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 p-2.5 text-[13px] font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group hover:bg-white/[0.04]",
              isUserDropdownOpen && "bg-white/[0.04]",
            )}
          >
            <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent group-hover:ring-white/10 transition-all">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  unoptimized
                  referrerPolicy="no-referrer"
                />
              ) : (
                <>
                  {user?.firstName?.charAt(0)?.toUpperCase()}
                  {user?.lastName?.charAt(0)?.toUpperCase()}
                </>
              )}
            </div>
            <div className="flex flex-col items-start overflow-hidden flex-1">
              <span className="text-[13px] font-semibold text-white/90 truncate w-full text-left">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[11px] text-white/40 font-medium truncate w-full text-left">
                {user?.email}
              </span>
            </div>
          </button>
        </div>
      </aside>

      {/* ── HEADER & MAIN AREA ── */}
      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        {/* Glassmorphic Header */}
        <header className="h-14 shrink-0 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/[0.05] flex items-center px-8 z-20 sticky top-0">
          <div className="flex items-center gap-2 text-[13px] font-medium ml-4">
            <span className="text-white/40 hover:text-white/60 transition-colors cursor-pointer">
              {activeWorkspace?.name || "Acme Corp"}
            </span>
            <ChevronRight size={14} className="text-white/20" />
            <span className="text-white/90">Dashboard</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <Search size={16} />
            </button>
            <button className="p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <Bell size={16} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#0A0A0A] transition-all duration-700 ease-in-out">
          <div className="max-w-6xl mx-auto w-full p-10">{children}</div>
        </main>
      </div>

      <CreateWorkspaceModal
        isOpen={isAddWorkspaceOpen}
        onClose={() => setIsAddWorkspaceOpen(false)}
      />

      <WorkspaceSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={(ws) => {
          setActiveWorkspace(ws);
          router.push(`/${ws.slug}`);
        }}
        onCreateWorkspace={() => setIsAddWorkspaceOpen(true)}
      />
    </div>
  );
}
