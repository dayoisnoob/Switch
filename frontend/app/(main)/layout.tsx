"use client";

import CreateWorkspaceModal from "@/components/modals/AddWorkspaceModal";
import WorkspaceSwitcherModal from "@/components/modals/SwitchWorkspaceModal";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import GlobalSearchModal from "@/components/modals/GlobalSearchModal";
import { SocketProvider } from "@/components/SocketProvider";
import { useLogout, useMe } from "@/hooks/useAuth";
import { useWorkspaceProjects } from "@/hooks/useProjects";
import { useGetMembers, useGetWorkspaces } from "@/hooks/useWorkspace";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/store/board.store";
import { useNotificationStore } from "@/store/notification.store";
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
import {
  LayoutSkeleton,
  ProjectsSkeleton,
} from "@/components/skeletons/main-layout/skeletons";

// ── HELPERS ──
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
  return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

const getPageLabel = (pathname: string, projectSlug?: string): string => {
  if (projectSlug) return "Board";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/notifications") return "Notifications";
  if (pathname.includes("tab=projects")) return "Projects";
  if (pathname.includes("tab=members")) return "Members";
  if (pathname.includes("tab=settings")) return "Settings";
  return "Dashboard";
};

// ── LAYOUT ──
export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const workspaceSlug = params?.workspaceSlug as string | undefined;
  const projectSlug = params?.projectSlug as string | undefined;

  const onlineUsers = useBoardStore((s) => s.presenceUsers) ?? [];

  const [isAddWorkspaceOpen, setIsAddWorkspaceOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const logout = useLogout();

  const { data: user, isLoading: userLoading } = useMe();
  const {
    data: workspaces = [],
    isLoading: workspacesLoading,
    isFetching,
  } = useGetWorkspaces();

  const { data: projects = [], isLoading: projectsLoading } =
    useWorkspaceProjects(activeWorkspace?.slug);
  const { data: members = [] } = useGetMembers(activeWorkspace?.slug ?? "");
  const { canManageWorkspace } = useWorkspaceRole(activeWorkspace?.slug ?? "");

  const hasWorkspaces = workspaces.length > 0;

  useEffect(() => {
    if (!workspacesLoading && !isFetching && workspaces.length === 0) {
      router.replace("/getting-started");
    }
  }, [workspacesLoading, workspaces.length, router]);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    document.addEventListener("open-search", handleOpenSearch);
    return () => document.removeEventListener("open-search", handleOpenSearch);
  }, []);

  useEffect(() => {
    if (!workspaces.length) return;

    if (workspaceSlug) {
      const matched = workspaces.find((w) => w.slug === workspaceSlug);
      if (matched && matched.slug !== activeWorkspace?.slug) {
        setActiveWorkspace(matched);
      }
    } else if (!activeWorkspace) {
      setActiveWorkspace(workspaces[0]);
    }
  }, [workspaces, workspaceSlug, activeWorkspace, setActiveWorkspace]);

  if (userLoading || workspacesLoading) {
    return <LayoutSkeleton />;
  }

  if (!hasWorkspaces) {
    return <LayoutSkeleton />;
  }

  const mainNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
      count: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  const workspaceNavItems = [
    {
      name: "Projects",
      href: `/${activeWorkspace?.slug}?tab=projects`,
      icon: Package,
      count: projects.length || undefined,
    },
    {
      name: "Members",
      href: `/${activeWorkspace?.slug}?tab=members`,
      icon: Users,
      count: members.length || undefined,
    },
    ...(canManageWorkspace
      ? [
          {
            name: "Settings",
            href: `/${activeWorkspace?.slug}?tab=settings`,
            icon: Settings2Icon,
          },
        ]
      : []),
  ];

  const pageLabel = getPageLabel(pathname, projectSlug);

  return (
    <SocketProvider>
      <div className="flex h-screen bg-[#0A0A0A] overflow-hidden text-[#A1A1AA] font-sans selection:bg-[#7C6EF5]/30">
        <aside className="w-65 shrink-0 bg-[#13131A] border-r border-white/5 flex flex-col z-20">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-6 px-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black shadow-[0_0_15px_rgba(124,110,245,0.4)]">
                S
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Switch
              </span>
            </div>

            <button
              onClick={() =>
                hasWorkspaces
                  ? setIsSwitcherOpen(!isSwitcherOpen)
                  : setIsAddWorkspaceOpen(true)
              }
              className={cn(
                "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 border group",
                isSwitcherOpen
                  ? "bg-white/5 border-white/10 shadow-sm"
                  : "bg-white/2 border-white/5 hover:bg-white/4 hover:border-white/10",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-white text-[11px] font-black transition-colors",
                  !hasWorkspaces &&
                    "bg-[#7C6EF5]/10 text-[#7C6EF5] group-hover:bg-[#7C6EF5]/20",
                )}
                style={
                  hasWorkspaces && activeWorkspace
                    ? { backgroundColor: activeWorkspace.colour }
                    : {}
                }
              >
                {hasWorkspaces ? (
                  activeWorkspace?.name ? (
                    getInitials(activeWorkspace.name)
                  ) : (
                    "AC"
                  )
                ) : (
                  <Plus size={16} />
                )}
              </div>
              <div className="flex flex-col items-start overflow-hidden flex-1">
                <span
                  className={cn(
                    "text-[13px] font-semibold truncate w-full text-left transition-colors",
                    hasWorkspaces ? "text-white/90" : "text-[#7C6EF5]",
                  )}
                >
                  {hasWorkspaces ? activeWorkspace?.name : "New Workspace"}
                </span>
                <span className="text-[10px] font-medium text-[#7C6EF5] mt-0.5">
                  {hasWorkspaces
                    ? canManageWorkspace
                      ? "Admin"
                      : "Member"
                    : "Create one to start"}
                </span>
              </div>
              {hasWorkspaces && (
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-white/40 shrink-0 ml-auto transition-transform duration-200",
                    isSwitcherOpen && "rotate-180 text-white/80",
                  )}
                />
              )}
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 py-2 overflow-y-auto custom-scrollbar">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-white/5 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <item.icon
                    size={16}
                    className={
                      isActive
                        ? "text-white"
                        : "text-white/40 group-hover:text-white/80"
                    }
                  />
                  {item.name}
                  {item.count !== undefined && (
                    <div className="ml-auto flex items-center justify-center px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-white/70 min-w-5 border border-white/5">
                      {item.count}
                    </div>
                  )}
                </Link>
              );
            })}

            {hasWorkspaces && (
              <div className="mt-8 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-2 px-3">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Projects
                  </span>
                </div>
                {projectsLoading ? (
                  <ProjectsSkeleton />
                ) : (
                  <div className="space-y-0.5">
                    {projects.map((p) => {
                      const color = getConsistentColor(p.id);
                      const isActive = projectSlug === p.slug;
                      return (
                        <Link
                          key={p.id}
                          href={`/${activeWorkspace?.slug}/${p.slug}`}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-lg transition-colors group",
                            isActive
                              ? "bg-white/5 text-white"
                              : "text-white/60 hover:bg-white/5 hover:text-white",
                          )}
                        >
                          <div
                            className="w-2 h-2 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-125"
                            style={{
                              backgroundColor: color,
                              boxShadow: `0 0 8px ${color}40`,
                            }}
                          />
                          <span className="truncate">{p.name}</span>
                        </Link>
                      );
                    })}
                    {canManageWorkspace && (
                      <button
                        onClick={() => setIsProjectModalOpen(true)}
                        className="flex items-center gap-3 px-3 py-2 mt-1 w-full text-left text-[13px] font-medium text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors group"
                      >
                        <Plus
                          size={14}
                          className="text-white/30 group-hover:text-white/70 transition-colors"
                        />
                        New project
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {hasWorkspaces && (
              <div className="mt-8 animate-in fade-in duration-300">
                <div className="mb-2 px-3">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                    Workspace
                  </span>
                </div>
                <div className="space-y-0.5">
                  {workspaceNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-white/60 hover:bg-white/5 hover:text-white rounded-lg transition-colors group"
                    >
                      <item.icon
                        size={16}
                        className="text-white/40 group-hover:text-white/80 transition-colors"
                      />
                      {item.name}
                      {item.count !== undefined && (
                        <div className="ml-auto flex items-center justify-center px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-white/70 min-w-5 border border-white/5">
                          {item.count}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>

          <div className="p-4 mt-auto relative">
            {isUserDropdownOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsUserDropdownOpen(false)}
              />
            )}
            {isUserDropdownOpen && (
              <div className="absolute bottom-[calc(100%-8px)] left-4 right-4 bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_-8px_30px_rgb(0,0,0,0.5)] z-50 overflow-hidden p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {hasWorkspaces && (
                  <>
                    <Link
                      href={`/${activeWorkspace?.slug}?tab=settings`}
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Settings size={15} />
                      <span>Account Settings</span>
                    </Link>
                    <div className="h-px bg-white/5 my-1 mx-1" />
                  </>
                )}
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
                "w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 hover:bg-white/5",
                isUserDropdownOpen && "bg-white/5",
              )}
            >
              <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent hover:ring-white/10 transition-all">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="Avatar"
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

        <div className="flex flex-col flex-1 min-w-0 relative z-10">
          <header className="h-14 shrink-0 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5 flex items-center px-8 z-20 sticky top-0">
            {hasWorkspaces && (
              <div className="flex items-center gap-2 text-[13px] font-medium ml-4 animate-in fade-in duration-300">
                <span className="text-white/40 hover:text-white/60 transition-colors cursor-pointer">
                  {activeWorkspace?.name}
                </span>
                <ChevronRight size={14} className="text-white/20" />
                <span className="text-white/90">{pageLabel}</span>
              </div>
            )}

            <div className="flex items-center gap-3 ml-auto">
              {projectSlug && onlineUsers.length > 0 && (
                <div className="flex items-center mr-2 pr-4 border-r border-white/5">
                  {projectSlug && onlineUsers.length > 0 && (
                    <div className="flex items-center mr-2 pr-4 border-r border-white/5">
                      <div className="flex items-center -space-x-2">
                        {onlineUsers.slice(0, 4).map((u, i) => (
                          <div
                            key={u.userId ?? i}
                            title={`${u.firstName} ${u.lastName}`}
                            className="w-8 h-8 rounded-full bg-[#1A1A24] border-2 border-[#0A0A0A] flex items-center justify-center relative z-10 hover:z-20 transition-transform hover:scale-110 cursor-default"
                          >
                            {u.avatarUrl ? (
                              <Image
                                src={u.avatarUrl}
                                alt={u.firstName ?? "User"}
                                width={28}
                                height={28}
                                className="w-full h-full object-cover rounded-full"
                                unoptimized
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-white">
                                {u.firstName?.charAt(0)}
                                {u.lastName?.charAt(0)}
                              </span>
                            )}
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0A0A0A]" />
                          </div>
                        ))}
                        {onlineUsers.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-[#0A0A0A] flex items-center justify-center text-[10px] font-bold text-white/50">
                            +{onlineUsers.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  )}{" "}
                </div>
              )}

              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <Search size={16} />
                <kbd className="hidden sm:inline-flex text-[10px] font-sans font-medium px-1.5 py-0.5 bg-white/5 rounded text-white/30">
                  ⌘K
                </kbd>
              </button>

              <Link
                href="/notifications"
                className="relative p-2 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#0A0A0A] shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                )}
              </Link>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#0E0E14] flex flex-col">
            <div
              className={cn(
                "w-full flex-1 flex flex-col",
                !projectSlug && "max-w-6xl mx-auto p-10",
              )}
            >
              {children}
            </div>
          </main>
        </div>

        <CreateWorkspaceModal
          isOpen={isAddWorkspaceOpen}
          onClose={() => setIsAddWorkspaceOpen(false)}
        />
        <CreateProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
        />
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          workspaceSlug={workspaceSlug ?? activeWorkspace?.slug}
          projects={projects}
          members={members}
          canManageWorkspace={canManageWorkspace}
          onAction={(actionId) => {
            if (actionId === "new-project") setIsProjectModalOpen(true);
            if (actionId === "logout") logout();
          }}
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
          onCreateWorkspace={() => {
            setIsSwitcherOpen(false);
            setIsAddWorkspaceOpen(true);
          }}
        />
      </div>
    </SocketProvider>
  );
}
