"use client";

import {
  Command,
  Package,
  Search,
  Settings2Icon,
  Users,
  ArrowRight,
  UserPlus,
  LogOut,
  PlusCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getConsistentColor } from "@/lib/utils"; // Assuming you have this helper!

// Types
interface Project {
  id: string;
  name: string;
  slug: string;
}
interface WorkspaceMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceSlug?: string;
  projects?: Project[];
  members?: WorkspaceMember[];
  canManageWorkspace?: boolean;
  onAction?: (action: string) => void;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  workspaceSlug,
  projects = [],
  members = [],
  canManageWorkspace = false,
  onAction,
}: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen
          ? onClose()
          : document.dispatchEvent(new CustomEvent("open-search"));
      }
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { name: "Projects", icon: Package, href: `/${workspaceSlug}?tab=projects` },
    {
      name: "Members Directory",
      icon: Users,
      href: `/${workspaceSlug}?tab=members`,
    },
    ...(canManageWorkspace
      ? [
          {
            name: "Workspace Settings",
            icon: Settings2Icon,
            href: `/${workspaceSlug}?tab=settings`,
          },
        ]
      : []),
  ];

  const quickActions = [
    ...(canManageWorkspace
      ? [{ id: "new-project", name: "Create New Project", icon: PlusCircle }]
      : []),
    { id: "logout", name: "Sign Out", icon: LogOut, danger: true },
  ];

  const normalizedQuery = query.toLowerCase().trim();

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(normalizedQuery),
  );
  const filteredLinks = quickLinks.filter((l) =>
    l.name.toLowerCase().includes(normalizedQuery),
  );
  const filteredActions = quickActions.filter((a) =>
    a.name.toLowerCase().includes(normalizedQuery),
  );

  const filteredMembers = members.filter((m) => {
    const fullName = `${m.firstName || ""} ${m.lastName || ""}`.toLowerCase();
    const email = (m.email || "").toLowerCase();
    return (
      fullName.includes(normalizedQuery) || email.includes(normalizedQuery)
    );
  });

  const hasResults =
    filteredProjects.length > 0 ||
    filteredLinks.length > 0 ||
    filteredMembers.length > 0 ||
    filteredActions.length > 0;

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleTriggerAction = (actionId: string) => {
    if (onAction) onAction(actionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
      <div
        className="fixed inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-[#13131A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-white/5">
          <Search size={18} className="text-[#7C6EF5] mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search projects, members, or type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-14 bg-transparent text-[15px] text-white placeholder:text-white/30 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center justify-center h-6 px-2 text-[10px] font-bold text-white/40 bg-white/5 border border-white/10 rounded ml-3">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {normalizedQuery === "" ? (
            <div className="py-2">
              <div className="px-3 pb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Quick Links
              </div>
              {quickLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavigate(link.href)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <link.icon size={16} className="text-white/30" /> {link.name}
                </button>
              ))}
            </div>
          ) : hasResults ? (
            <div className="py-2 space-y-4">
              {/* Projects */}
              {filteredProjects.length > 0 && (
                <div>
                  <div className="px-3 pb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Projects
                  </div>
                  {filteredProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() =>
                        handleNavigate(`/${workspaceSlug}/${project.slug}`)
                      }
                      className="w-full flex items-center justify-between px-3 py-2.5 text-[13px] font-medium text-white/70 hover:text-white hover:bg-[#7C6EF5]/10 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Package
                          size={16}
                          className="text-[#7C6EF5]/60 group-hover:text-[#7C6EF5]"
                        />{" "}
                        {project.name}
                      </div>
                      <ArrowRight
                        size={14}
                        className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#7C6EF5]"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* 🌟 Members (NEW) */}
              {filteredMembers.length > 0 && (
                <div>
                  <div className="px-3 pb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Members
                  </div>
                  {filteredMembers.map((member) => {
                    const name =
                      `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
                      "Unknown";
                    return (
                      <button
                        key={member.id}
                        onClick={() =>
                          handleNavigate(
                            `/${workspaceSlug}?tab=members&search=${member.firstName}`,
                          )
                        }
                        className="w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          {member.avatarUrl ? (
                            <Image
                              src={member.avatarUrl}
                              alt={name}
                              width={24}
                              height={24}
                              className="w-6 h-6 rounded-full object-cover border border-white/10"
                              unoptimized
                            />
                          ) : (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-white/10"
                              style={{
                                backgroundColor: getConsistentColor(member.id),
                              }}
                            >
                              {name.charAt(0)}
                            </div>
                          )}
                          <div className="flex flex-col items-start">
                            <span>{name}</span>
                            <span className="text-[11px] text-white/30 font-normal leading-none mt-0.5">
                              {member.email}
                            </span>
                          </div>
                        </div>
                        <ArrowRight
                          size={14}
                          className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-white/40"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 🌟 Commands/Actions (NEW) */}
              {filteredActions.length > 0 && (
                <div>
                  <div className="px-3 pb-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    Commands
                  </div>
                  {filteredActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleTriggerAction(action.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all group ${action.danger ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                    >
                      <action.icon
                        size={16}
                        className={
                          action.danger
                            ? "text-rose-400/70 group-hover:text-rose-300"
                            : "text-white/30 group-hover:text-white/70"
                        }
                      />
                      {action.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Command size={20} className="text-white/30" />
              </div>
              <p className="text-[14px] text-white/80 font-semibold">
                No results found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
