"use client";

import AddWorkspaceModal from "@/components/modals/AddWorkspaceModal";
import CreateWorkspaceModal from "@/components/modals/CreateWorkspaceModal";
import { useLogout, useMe } from "@/hooks/useAuth";
import { cn, getErrorMessage } from "@/lib/utils";
import { WorkspaceService } from "@/services/workspace.service";
import { useWorkspaceStore } from "@/store/workspace.store";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFirstWorkspaceOpen, setIsFirstWorkspaceOpen] = useState(false);
  const [isAddWorkspaceOpen, setIsAddWorkspaceOpen] = useState(false);

  const setWorkspaces = useWorkspaceStore((s) => s.setWorkspaces);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);

  const { data: user, isLoading } = useMe();
  const logout = useLogout();

  useEffect(() => {
    const syncWorkspaces = async () => {
      try {
        const data = await WorkspaceService.getWorkspaces();
        if (data && data.length > 0) {
          setWorkspaces(data);
          // setActiveWorkspace(data[0]);
        } else {
          setIsFirstWorkspaceOpen(true);
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setIsInitialLoading(false);
      }
    };

    syncWorkspaces();
  }, [setActiveWorkspace, setWorkspaces]);

  const navItems = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  if (isInitialLoading || isLoading) {
    return (
      <div className="h-screen w-full bg-[#0b0e14] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#58a6ff]"></div>
      </div>
    );
  }

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center gap-3 p-2 animate-pulse">
  //       <div className="w-9 h-9 rounded-lg bg-[#30363d]" />
  //       <div className="flex flex-col gap-2 flex-1">
  //         <div className="h-3 w-24 bg-[#30363d] rounded" />
  //         <div className="h-2 w-16 bg-[#30363d] rounded" />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex h-screen bg-[#0b0e14] overflow-hidden text-[#c9d1d9] font-sans">
      <aside className="w-60 shrink-0 bg-[#0d1117] border-r border-[#1e222b] flex flex-col">
        <div className="p-4 mb-2">
          <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#161b22] transition-all group border border-transparent hover:border-[#30363d]">
            <div className="w-9 h-9 rounded-lg bg-[#238636] flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </div>
            <div className="flex flex-col items-start overflow-hidden flex-1">
              <span className="text-sm font-semibold text-[#f0f6fc] truncate">
                {user?.firstName} {user?.lastName}{" "}
              </span>
              <span className="text-[11px] text-[#8b949e] font-medium">
                {user?.email}
              </span>
            </div>
            <ChevronDown
              size={14}
              className="text-[#484f58] group-hover:text-[#8b949e]"
            />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all group",
                  isActive
                    ? "bg-[#1c2128] text-[#f0f6fc] shadow-sm"
                    : "text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]",
                )}
              >
                <item.icon
                  size={18}
                  className={cn(
                    isActive ? "text-[#58a6ff]" : "group-hover:text-[#c9d1d9]",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 px-3">
          <div className="flex items-center justify-between mb-2 px-3">
            <span className="text-[10px] font-bold text-[#484f58] uppercase tracking-widest">
              Workspaces
            </span>
            <button
              onClick={() => setIsAddWorkspaceOpen(true)}
              className="text-[#484f58] hover:text-white transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-0.5">
            {workspaces.map((ws) => {
              const isSelected = activeWorkspace?.id === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    router.push(`/${ws.slug}`);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all group",
                    isSelected
                      ? "bg-[#1c2128] text-[#f0f6fc] border border-[#30363d]"
                      : "text-[#8b949e] hover:bg-[#161b22]",
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isSelected
                        ? "bg-[#58a6ff]"
                        : "bg-[#484f58] group-hover:bg-[#8b949e]",
                    )}
                  />
                  <span className="truncate">{ws.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-[#1e222b] space-y-1">
          <button
            onClick={logout}
            className="w-full cursor-pointer flex items-center gap-3 px-3 py-2 text-sm text-[#8b949e] hover:text-red-400 rounded-md transition-colors"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-14 shrink-0 bg-[#0b0e14] border-b border-[#1e222b] flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-[#8b949e]">Home</span>
              <span className="text-[#484f58]">/</span>
              <span className="text-[#f0f6fc]">Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]"
              />
              <input
                type="text"
                placeholder="Search..."
                className="bg-[#11141a] border border-[#30363d] rounded-md pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#58a6ff] w-48 transition-all"
              />
            </div>
            <button className="relative p-2 text-[#8b949e] hover:text-[#f0f6fc] transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full border-2 border-[#0b0e14]" />
            </button>
          </div>
        </header>

        <main
          className={cn(
            "flex-1 overflow-y-auto custom-scrollbar transition-all duration-700 ease-in-out",
            // !activeWorkspace ? "blur-xl pointer-events-none" : "blur-0",
          )}
        >
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
