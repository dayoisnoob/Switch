"use client";

import { Portal } from "@/components/ui/Portal";
import { cn } from "@/lib/utils";
import { Workspace } from "@/services/workspace.service";
import { Check, Plus, Search } from "lucide-react";
import { useState } from "react";

interface WorkspaceSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  onSelectWorkspace: (workspace: Workspace) => void;
  onCreateWorkspace: () => void;
}

export default function WorkspaceSwitcherModal({
  isOpen,
  onClose,
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  onCreateWorkspace,
}: WorkspaceSwitcherModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // 1. REMOVED the early return from here!

  // Filter workspaces based on search query
  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Helper for avatars
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Portal>
      {/* 2. ADDED the isOpen check wrapping the actual UI inside the Portal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
          onClick={onClose}
        >
          {/* Modal Panel - Stop propagation so clicking inside doesn't close it */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[380px] bg-[#0A0A0A] border border-white/8 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* ── SEARCH AREA ── */}
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/3 border border-white/8 focus:border-[#7C6EF5]/50 focus:bg-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* ── WORKSPACE LIST ── */}
            <div className="p-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
              <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Your Workspaces
              </div>

              <div className="space-y-1 mt-1">
                {filteredWorkspaces.length === 0 ? (
                  <div className="py-6 text-center text-sm text-white/40">
                    No workspaces found for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredWorkspaces.map((ws) => {
                    const isActive = activeWorkspace?.id === ws.id;

                    return (
                      <button
                        key={ws.id}
                        onClick={() => {
                          onSelectWorkspace(ws);
                          onClose();
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left group",
                          isActive
                            ? "bg-[#2d1b4e]/60 border border-[#7C6EF5]/20"
                            : "border border-transparent hover:bg-white/4",
                        )}
                      >
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm"
                          style={{ backgroundColor: ws.colour || "#7C6EF5" }}
                        >
                          {getInitials(ws.name)}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="text-[14px] font-semibold text-white/90 truncate">
                            {ws.name}
                          </span>
                          <span className="text-[12px] text-white/40 truncate mt-0.5">
                            {ws.role || "Member"} · {ws.projectsCount || 0}{" "}
                            projects
                          </span>
                        </div>

                        {/* Active Checkmark */}
                        {isActive && (
                          <Check
                            size={18}
                            className="text-[#7C6EF5] mr-2 shrink-0 animate-in zoom-in duration-300"
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── FOOTER: CREATE WORKSPACE ── */}
            <div className="p-2 border-t border-white/5 bg-[#050505]">
              <button
                onClick={() => {
                  onClose();
                  onCreateWorkspace();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/4 transition-colors text-left group"
              >
                <div className="w-9 h-9 shrink-0 rounded-lg border border-dashed border-white/20 flex items-center justify-center group-hover:border-[#7C6EF5]/50 group-hover:bg-[#7C6EF5]/10 transition-all">
                  <Plus
                    size={18}
                    className="text-white/40 group-hover:text-[#7C6EF5] transition-colors"
                  />
                </div>
                <span className="text-[14px] font-semibold text-white/60 group-hover:text-white/90 transition-colors">
                  Create workspace
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </Portal>
  );
}
