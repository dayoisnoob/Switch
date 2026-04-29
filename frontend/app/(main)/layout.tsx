"use client";

import AddWorkspaceModal from "@/components/modals/AddWorkspaceModal";
import CreateWorkspaceModal from "@/components/modals/CreateWorkspaceModal";
import { useLogout, useMe } from "@/hooks/useAuth";
import { useWorkspaceProjects } from "@/hooks/useProjects";
import { cn, getErrorMessage } from "@/lib/utils";
import { WorkspaceService } from "@/services/workspace.service";
import { useAuthStore } from "@/store/auth.store";
import { useWorkspaceStore } from "@/store/workspace.store";
import {
  Bell,
  ChevronDown,
  LayoutGrid, // Solid purple dashboard in design
  LogOut,
  Plus,
  Search,
  Settings,
  Users, // Workspace section icons
  Package,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFirstWorkspaceOpen, setIsFirstWorkspaceOpen] = useState(false);
  const [isAddWorkspaceOpen, setIsAddWorkspaceOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const setWorkspaces = useWorkspaceStore((s) => s.setWorkspaces);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const workspaceMembers = useWorkspaceStore((s) => s.workspaceMembers);
  const syncMembers = useWorkspaceStore((s) => s.syncMembers);
  const setUser = useAuthStore((s) => s.setUser);

  const logout = useLogout();
  const { data: user, isLoading: isUserLoading } = useMe();
  const { data: projects } = useWorkspaceProjects(activeWorkspace?.slug);
  console.log(activeWorkspace);

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

  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await WorkspaceService.getWorkspaces();
        if (data && data.length > 0) {
          setWorkspaces(data);
          if (!activeWorkspace) setActiveWorkspace(data[0]);
        }
      } catch (err) {
        toast.error(getErrorMessage(err) || "Failed to load workspaces");
      } finally {
        setIsInitialLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (activeWorkspace?.slug) {
      syncMembers(activeWorkspace.slug);
    }
  }, [activeWorkspace?.slug, syncMembers]);

  // Main navigation items for top-level app nav
  const mainNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutGrid }, // solid purple in design
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
      count: 4,
    },
  ];

  // Workspace-specific navigation
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
      count: workspaceMembers.length,
    },
  ];

  // Mock projects for the middle section
  // const projects = [
  //   { id: "proj-1", name: "Design System", color: "#38bdf8" }, // teal
  //   { id: "proj-2", name: "API Refactor", color: "#fb7185" }, // rose/pink
  //   { id: "proj-3", name: "Mobile App v2", color: "#fbbf24" }, // amber
  //   { id: "proj-4", name: "Marketing Site", color: "#a855f7" }, // purple
  // ];

  if (isInitialLoading || isUserLoading || !projects) {
    return (
      <div className="h-screen w-full bg-[#101010] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#7C6EF5]"></div>
      </div>
    );
  }

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
        <div className="p-3 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg bg-[#7C6EF5] flex items-center justify-center text-white text-xs font-black">
              S
            </div>
            <span className="text-xl font-black text-white">Switch</span>
          </div>
          <div className="p-3 border-b border-[#2a2a2a] relative">
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
      <div className="flex flex-col  flex-1 min-w-0">
        {/* HEADER: Unified background with content area */}
        <header className="h-16 shrink-0 bg-[#0f0f16] border-b border-[#2a2a2a] flex items-center px-8">
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
              <ChevronDown size={14} className="text-[#a1a1a1]" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-black transition-all duration-700 ease-in-out px-12 py-10">
          {children}
        </main>
      </div>

      <CreateWorkspaceModal
        isOpen={isFirstWorkspaceOpen}
        onClose={() => setIsFirstWorkspaceOpen(false)}
      />

      <AddWorkspaceModal
        isOpen={isAddWorkspaceOpen}
        onClose={() => setIsAddWorkspaceOpen(false)}
      />
    </div>
  );
}
