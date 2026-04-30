"use client";

import CreateWorkspaceModal from "@/components/modals/AddWorkspaceModal";
import { useLogout, useMe } from "@/hooks/useAuth";
import { useGetWorkspaceProjects } from "@/hooks/useProjects";
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
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isFirstWorkspaceOpen, setIsFirstWorkspaceOpen] = useState(false);
  const [isAddWorkspaceOpen, setIsAddWorkspaceOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  const logout = useLogout();
  const { data: user, isLoading: userLoading } = useMe();
  const { data: workspaces = [], isLoading: workspacesLoading } =
    useGetWorkspaces();
  const { data: projects = [], isLoading: projectsLoading } =
    useGetWorkspaceProjects(activeWorkspace?.slug);

  useEffect(() => {
    if (workspaces.length === 0 && !workspacesLoading) {
      router.replace("/");
    }
  }, [workspacesLoading, router, workspaces]);

  useEffect(() => {
    if (workspaces.length > 0 && !activeWorkspace) {
      setActiveWorkspace(workspaces[0]);
    }
  }, [workspaces, activeWorkspace, setActiveWorkspace]);

  const { data: members = [], isLoading: membersLoading } = useGetMembers(
    activeWorkspace?.slug,
  );

  if (workspaces.length === 0 && !workspacesLoading) {
    return null;
  }

  if (workspacesLoading || userLoading || projectsLoading || membersLoading) {
    return (
      <div className="flex h-screen bg-[#0f0f16] overflow-hidden font-sans">
        {/* Sidebar Skeleton */}
        <aside className="w-60 shrink-0 bg-[#0f0f16] border border-[#221f29] flex flex-col">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#7C6EF5] flex items-center justify-center text-white text-xs font-black">
                S
              </div>
              <span className="text-xl font-black text-white">Switch</span>
            </div>
            {/* Workspace Button Skeleton */}
            <div className="h-14 w-full bg-[#151520] rounded-lg animate-pulse border border-[#151520]" />
          </div>

          <div className="flex-1 px-3 space-y-8 py-4">
            {/* Nav Skeleton */}
            <div className="space-y-2 animate-pulse">
              <div className="h-10 w-full bg-[#151520] rounded-md" />
              <div className="h-10 w-full bg-[#151520] rounded-md" />
            </div>

            {/* Projects List Skeleton */}
            <div>
              <div className="h-3 w-16 bg-[#151520] rounded mb-4 ml-3 animate-pulse" />
              <div className="space-y-3 px-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
                  <div className="h-3 w-24 bg-[#151520] rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
                  <div className="h-3 w-20 bg-[#151520] rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
                  <div className="h-3 w-28 bg-[#151520] rounded" />
                </div>
              </div>
            </div>

            {/* Settings List Skeleton */}
            <div>
              <div className="h-3 w-16 bg-[#151520] rounded mb-4 ml-3 animate-pulse" />
              <div className="space-y-2 animate-pulse">
                <div className="h-10 w-full bg-[#151520] rounded-md" />
                <div className="h-10 w-full bg-[#151520] rounded-md" />
              </div>
            </div>
          </div>

          {/* User Profile Skeleton */}
          <div className="p-3 border-t border-[#2a2a2a] mt-auto">
            <div className="flex items-center gap-3 p-2.5 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-[#2a2a2a] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 bg-[#2a2a2a] rounded" />
                <div className="h-2 w-24 bg-[#151520] rounded" />
              </div>
            </div>
          </div>
        </aside>

        {/* Header & Main Area Skeleton */}
        <div className="flex flex-col flex-1 min-w-0">
          <header className="h-14 shrink-0 bg-[#0f0f16] border-b border-[#2a2a2a] flex items-center px-8">
            <div className="ml-12 h-4 w-40 bg-[#151520] rounded animate-pulse" />
            <div className="ml-auto flex items-center gap-4 animate-pulse">
              <div className="w-5 h-5 bg-[#151520] rounded" />
              <div className="w-5 h-5 bg-[#151520] rounded" />
              <div className="w-8 h-8 rounded-full bg-[#2a2a2a] border border-[#2a2a2a]" />
            </div>
          </header>

          <main className="flex-1 bg-black p-12">
            {/* Generic Page Content Skeleton to fill the space */}
            <div className="max-w-6xl mx-auto w-full animate-pulse space-y-6 opacity-30">
              <div className="h-8 w-64 bg-[#1C1C1E] rounded-md" />
              <div className="h-4 w-96 bg-[#1C1C1E] rounded-md" />
              <div className="grid grid-cols-4 gap-4 pt-4">
                <div className="h-28 bg-[#1C1C1E] rounded-xl" />
                <div className="h-28 bg-[#1C1C1E] rounded-xl" />
                <div className="h-28 bg-[#1C1C1E] rounded-xl" />
                <div className="h-28 bg-[#1C1C1E] rounded-xl" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // A premium palette of dark-mode-friendly vibrant colors
  const PROJECT_COLORS = [
    "#38bdf8", // Sky Blue
    "#818cf8", // Indigo
    "#a855f7", // Purple
    "#fb7185", // Rose
    "#fbbf24", // Amber
    "#34d399", // Emerald
  ];

  // Takes a string (like an ID) and consistently returns the exact same color
  const getConsistentColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PROJECT_COLORS.length;
    return PROJECT_COLORS[index];
  };

  const mainNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid }, // solid purple in design
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
      href: `/${activeWorkspace?.slug}/projects`,
      icon: Package,
      count: projects?.length,
    },
    {
      name: "Members",
      href: `/${activeWorkspace?.slug}/members`,
      icon: Users,
      count: members.length,
    },
  ];

  // Helper function to get initials for avatars
  const getInitials = (wsName: string) => {
    return wsName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden text-[#c9d1d9] font-sans">
      {/* ── SIDEBAR (charcoal dark gray) ── */}
      <aside className="w-60 shrink-0 bg-[#0f0f16] border-r border-[#2a2a2a] flex flex-col">
        {/* Active Workspace Switcher (Top) */}
        <div className="p-3 ">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#7C6EF5] flex items-center justify-center text-white text-xs font-black">
              S
            </div>
            <span className="text-xl font-black text-white">Switch</span>
          </div>
          <div className="relative border border-[#151520] rounded-lg">
            {/* workspace button */}
            <button
              onClick={() =>
                setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)
              }
              className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all group hover:bg-[#151520] bg-[#151520]"
            >
              {/* active workspace avatar */}
              <div className="w-9 h-9 shrink-0 rounded-lg overflow-hidden bg-[#7C6EF5] flex items-center justify-center text-white text-sm font-black shadow-sm">
                {activeWorkspace?.name
                  ? getInitials(activeWorkspace.name)
                  : "AC"}
              </div>

              <div className="flex flex-col items-start overflow-hidden flex-1">
                <span className="text-sm font-semibold text-white truncate w-full text-left">
                  {activeWorkspace?.name}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-[#7C6EF5]/10 text-[#7C6EF5] mt-1">
                  Owner
                </span>
              </div>

              <ChevronDown
                size={14}
                className={cn(
                  "text-[#a1a1a1] group-hover:text-white shrink-0 ml-auto transition-transform duration-200",
                  isWorkspaceDropdownOpen && "rotate-180",
                )}
              />
            </button>

            {/* ── THE DROPDOWN MENU ── */}
            {isWorkspaceDropdownOpen && (
              <>
                {/* Invisible overlay: clicks anywhere outside close the menu */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsWorkspaceDropdownOpen(false)}
                />

                {/* Dropdown Panel */}
                <div className="absolute top-[calc(100%-8px)] left-3 right-3 bg-[#151520] rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col">
                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
                    <div className="px-2 py-1.5 text-[10px] font-black text-[#8b949e] uppercase tracking-widest">
                      Your Workspaces
                    </div>

                    {workspaces.map((ws) => {
                      const isActive = activeWorkspace?.id === ws.id;
                      return (
                        <Link
                          key={ws.id}
                          href={`/${ws.slug}`}
                          onClick={() => {
                            setActiveWorkspace(ws);
                            setIsWorkspaceDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 p-2 rounded-md transition-colors",
                            isActive
                              ? "bg-[#7C6EF5]/10 text-white"
                              : "text-[#a1a1a1] hover:bg-[#151520] hover:text-white",
                          )}
                        >
                          <div className="w-6 h-6 shrink-0 rounded flex items-center justify-center text-[10px] font-black bg-[#2a2a2a] text-white">
                            {getInitials(ws.name)}
                          </div>
                          <span className="text-sm font-medium truncate flex-1 text-left">
                            {ws.name}
                          </span>
                          {isActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#7C6EF5]" />
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Create New Workspace Action */}
                  <div className="p-1.5 border-t border-[#2a2a2a] bg-[#151515]">
                    <button
                      onClick={() => {
                        setIsAddWorkspaceOpen(true);
                        setIsWorkspaceDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 text-sm font-medium text-[#a1a1a1] hover:text-white hover:bg-[#151520] rounded-md transition-colors"
                    >
                      <Plus size={16} />
                      <span>Create Workspace</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 space-y-1 py-4 custom-scrollbar overflow-y-auto">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold rounded-md transition-all group relative",
                  isActive
                    ? "bg-[#7C6EF5]/10 text-white shadow-sm"
                    : "text-[#a1a1a1] hover:bg-[#151520] hover:text-white",
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#7C6EF5] rounded-l-md" />
                )}
                <item.icon
                  size={18}
                  className={cn(
                    isActive
                      ? "text-[#7C6EF5]"
                      : "text-[#a1a1a1] group-hover:text-white",
                  )}
                />
                {item.name}
                {item.count && (
                  <div className="ml-auto inline-flex items-center justify-center px-1.5 py-0.5 rounded-sm bg-[#151520] text-[10px] font-black text-[#a1a1a1] min-w-4.5">
                    {item.count}
                  </div>
                )}
              </Link>
            );
          })}

          {/* ── PROJECTS SECTION ── */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3 px-3.5">
              <span className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest">
                Projects
              </span>
              <button className="text-[#a1a1a1] hover:text-white transition-colors">
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-1">
              {/* Assuming `projects` comes from your store/API */}
              {projects.map((proj) => {
                // Dynamically assign a consistent color based on the ID
                const dynamicColor = getConsistentColor(proj.id);

                return (
                  <Link
                    key={proj.id}
                    href={`/dashboard/projects/${proj.id}`}
                    className="flex items-center gap-3 px-3.5 py-2 text-sm text-[#a1a1a1] hover:bg-[#151520] hover:text-white rounded-md"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: dynamicColor }}
                    />
                    <span className="truncate">{proj.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── WORKSPACE SECTION ── */}
          <div className="mt-8">
            <div className="flex items-center mb-3 px-3.5">
              <span className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest">
                Workspace
              </span>
            </div>
            <div className="space-y-1">
              {workspaceSettingsNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-[#a1a1a1] hover:bg-[#151520] hover:text-white rounded-md"
                >
                  <item.icon
                    size={18}
                    className="text-[#a1a1a1] group-hover:text-white"
                  />
                  {item.name}

                  <div className="ml-auto inline-flex items-center justify-center px-1.5 py-0.5 rounded-sm bg-[#151520] text-[10px] font-black text-[#a1a1a1] min-w-4.5">
                    {item.count}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* User Profile / Logout (Moved to Bottom) */}
        {/* ── USER PROFILE / LOGOUT (Drop-up) ── */}
        <div className="p-3 border-t border-[#2a2a2a] mt-auto relative">
          {/* Invisible overlay for closing */}
          {isUserDropdownOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsUserDropdownOpen(false)}
            />
          )}

          {/* ── THE DROP-UP MENU ── */}
          {isUserDropdownOpen && (
            <div className="absolute bottom-[calc(100%-4px)] left-3 right-3 bg-[#121218] border border-[#2a2a2a] rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Link
                href="/dashboard/settings"
                onClick={() => setIsUserDropdownOpen(false)}
                className="w-full flex items-center gap-3 p-2 text-sm font-medium text-[#a1a1a1] hover:text-white hover:bg-[#151520] rounded-md transition-colors"
              >
                <Settings size={16} />
                <span>Account Settings</span>
              </Link>

              <div className="h-px bg-[#2a2a2a] my-1 mx-1" />

              <button
                onClick={() => {
                  setIsUserDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 p-2 text-sm font-medium text-[#a1a1a1] hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* ── THE TRIGGER BUTTON ── */}
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 rounded-lg transition-all group hover:bg-[#151520]",
              isUserDropdownOpen && "bg-[#252529]", // Keep highlighted when open
            )}
          >
            <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-[#2a2a2a] flex items-center justify-center text-white text-xs font-black shadow-sm">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  width={36}
                  height={36}
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
              <span className="text-sm font-semibold text-white truncate w-full text-left">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[11px] text-[#a1a1a1] font-medium truncate w-full text-left">
                {user?.email}
              </span>
            </div>

            <ChevronDown
              size={14}
              className={cn(
                "text-[#a1a1a1] group-hover:text-white shrink-0 ml-auto transition-transform duration-200",
                isUserDropdownOpen && "rotate-180", // Flips the arrow!
              )}
            />
          </button>
        </div>
      </aside>

      {/* ── HEADER & MAIN AREA (True Black) ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* HEADER: Unified background with content area */}
        <header className="h-14 shrink-0 bg-[#0f0f16] border-b border-[#2a2a2a] flex items-center px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-medium ml-12">
            <span className="text-[#a1a1a1]">
              {activeWorkspace?.name || "Acme Corp"}
            </span>
            <ChevronRight size={14} />
            <span className="text-white">Dashboard</span>
          </div>

          {/* Right-side Icons */}
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-[#a1a1a1] hover:text-white transition-colors">
              <Search size={18} />
            </button>
            <button className="p-2 text-[#a1a1a1] hover:text-white transition-colors">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2a2a2a] flex items-center justify-center text-white text-xs font-black border border-[#2a2a2a]">
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
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f0d14] transition-all duration-700 ease-in-out px-12 py-10">
          {children}
        </main>
      </div>

      <CreateWorkspaceModal
        isOpen={isAddWorkspaceOpen}
        onClose={() => setIsFirstWorkspaceOpen(false)}
      />
    </div>
  );
}
