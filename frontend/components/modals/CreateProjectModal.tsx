"use client";

import { useCreateProject } from "@/hooks/useProjects";
import { useGetWorkspaces } from "@/hooks/useWorkspace";
import {
  AlignLeft,
  BarChart3,
  Briefcase,
  Check,
  ChevronDown,
  Code2,
  Database,
  FileText,
  Layers3,
  Megaphone,
  Palette,
  PenTool,
  Plus,
  Rocket,
  Settings,
  Smartphone,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";

export const PROJECT_ICONS: {
  value: string;
  label: string;
  Icon: LucideIcon;
}[] = [
  { value: "Palette", label: "Design", Icon: Palette },
  { value: "Code2", label: "Development", Icon: Code2 },
  { value: "Database", label: "Backend", Icon: Database },
  { value: "Smartphone", label: "Mobile", Icon: Smartphone },
  { value: "PenTool", label: "Creative", Icon: PenTool },
  { value: "FileText", label: "Docs", Icon: FileText },
  { value: "Briefcase", label: "Business", Icon: Briefcase },
  { value: "Rocket", label: "Launch", Icon: Rocket },
  { value: "Layers3", label: "Product", Icon: Layers3 },
  { value: "Megaphone", label: "Marketing", Icon: Megaphone },
  { value: "BarChart3", label: "Analytics", Icon: BarChart3 },
  { value: "Settings", label: "Ops", Icon: Settings },
];

export const PROJECT_ICON_MAP: Record<string, LucideIcon> = {
  Palette,
  Code2,
  Database,
  Smartphone,
  PenTool,
  FileText,
  Briefcase,
  Rocket,
  Layers3,
  Megaphone,
  BarChart3,
  Settings,
};

export default function CreateProjectModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Palette");
  const [showIconPicker, setShowIconPicker] = useState(false);

  const iconPickerRef = useRef<HTMLDivElement>(null);

  const { data: workspaces, isLoading: workspacesLoading } = useGetWorkspaces();
  const [manualWorkspaceId, setManualWorkspaceId] = useState<string | null>(
    null,
  );

  const activeWorkspaceId = manualWorkspaceId ?? (workspaces?.[0]?.id || "");
  const activeWorkspace =
    workspaces?.find((w) => w.id === activeWorkspaceId) || null;

  const { mutate: createProject, isPending: creatingProject } =
    useCreateProject();
  const selectedIcon =
    PROJECT_ICONS.find((item) => item.value === icon) || PROJECT_ICONS[0];

  const CurrentIcon = selectedIcon.Icon;

  const handleSubmit = () => {
    if (!name || !activeWorkspace || !icon) return;

    createProject({
      name,
      description,
      icon,
      workspaceId: activeWorkspace.id,
      workspaceSlug: activeWorkspace.slug,
    });
  };

  const handleCloseModal = () => {
    onClose();
    setName("");
    setDescription("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/70 px-4"
      onClick={handleCloseModal}
    >
      <div
        className="relative flex w-full max-w-115 flex-col rounded-2xl border border-[#26242c] bg-[#141218]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#6e6b7b] transition-colors hover:text-white"
        >
          <X size={16} strokeWidth={1.5} />
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#4aba85]/10 text-[#4aba85]">
              <AlignLeft size={18} strokeWidth={1.5} />
            </div>

            <h1 className="mb-1.5 text-xl font-bold tracking-tight text-white">
              New project
            </h1>

            <p className="text-[13px] leading-relaxed text-[#8b8898]">
              Projects contain boards, columns, and cards for your team&apos;s
              work.
            </p>
          </div>

          <div className="space-y-5">
            {/* Row */}
            <div className="flex items-start gap-3">
              {/* Icon Picker */}
              <div className="relative" ref={iconPickerRef}>
                <div className="mb-1.5 text-[12px] font-semibold text-[#8b8898]">
                  Icon
                </div>

                <button
                  type="button"
                  onClick={() => setShowIconPicker((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2c2a35] bg-[#1a1820] text-white transition-colors hover:border-[#433f52]"
                >
                  <CurrentIcon size={18} strokeWidth={1.8} />
                </button>

                {showIconPicker && (
                  <div className="absolute left-0 top-13 z-50 w-55 rounded-xl border border-[#2c2a35] bg-[#18161d] p-2 shadow-xl">
                    <div className="grid grid-cols-4 gap-2">
                      {PROJECT_ICONS.map((item) => {
                        const ActiveIcon = item.Icon;
                        const active = icon === item.value;

                        return (
                          <button
                            key={item.value}
                            type="button"
                            title={item.label}
                            onClick={() => {
                              setIcon(item.value);
                              setShowIconPicker(false);
                            }}
                            className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                              active
                                ? "border-[#a855f7] bg-[#a855f7]/10 text-[#a855f7]"
                                : "border-[#2c2a35] bg-[#1f1c24] text-[#b7b4c4] hover:border-[#433f52] hover:text-white"
                            }`}
                          >
                            <ActiveIcon size={18} strokeWidth={1.8} />

                            {active && (
                              <Check
                                size={11}
                                className="absolute right-1 top-1"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="flex-1">
                <div className="mb-1.5 flex gap-1 text-[12px] font-semibold text-[#8b8898]">
                  Project name
                  <span className="text-[#a855f7]">*</span>
                </div>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Design System"
                  autoFocus
                  className="h-10 w-full rounded-lg border border-[#2c2a35] bg-[#1a1820] px-3 text-[13px] text-white outline-none transition-all placeholder:text-[#524f5f] focus:border-[#a855f7]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="mb-1.5 text-[12px] font-semibold text-[#8b8898]">
                Description
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What is this project about?"
                className="w-full resize-none rounded-lg border border-[#2c2a35] bg-[#1a1820] p-3 text-[13px] text-white outline-none transition-all placeholder:text-[#524f5f] focus:border-[#a855f7]"
              />
            </div>

            {/* Workspace */}
            <div>
              <div className="mb-1.5 text-[12px] font-semibold text-[#8b8898]">
                Workspace
              </div>

              <div className="relative">
                <select
                  value={activeWorkspaceId}
                  onChange={(e) => setManualWorkspaceId(e.target.value)}
                  disabled={workspacesLoading || !workspaces?.length}
                  className="h-10 w-full appearance-none rounded-lg border border-[#2c2a35] bg-[#1a1820] px-3 text-[13px] text-white outline-none"
                >
                  {workspacesLoading ? (
                    <option>Loading workspaces...</option>
                  ) : (
                    workspaces?.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name}
                      </option>
                    ))
                  )}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6e6b7b]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-transparent px-4 py-2 text-[13px] font-semibold text-[#8b8898] transition-colors hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!name.trim() || creatingProject || workspacesLoading}
            className="flex items-center gap-2 rounded-lg bg-[#a855f7] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#9333ea] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={14} strokeWidth={2} />
            Create project
          </button>
        </div>
      </div>
    </div>
  );
}
