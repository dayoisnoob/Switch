"use client";
import { Portal } from "@/components/ui/Portal";

import { useCreateProject, useUpdateProject } from "@/hooks/useProjects";
import { useGetWorkspaces } from "@/hooks/useWorkspace";
import { Project } from "@/services/projects.service";
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
  project,
}: {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Palette");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [manualWorkspaceId, setManualWorkspaceId] = useState<string | null>(
    null,
  );

  const [prevProjectId, setPrevProjectId] = useState(project?.id);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (project?.id !== prevProjectId || isOpen !== prevIsOpen) {
    setPrevProjectId(project?.id);
    setPrevIsOpen(isOpen);

    if (isOpen) {
      setName(project?.name || "");
      setDescription(project?.description || "");
      setIcon(project?.icon || "Palette");
    }
  }

  const iconPickerRef = useRef<HTMLDivElement>(null);

  const { data: workspaces, isLoading: workspacesLoading } = useGetWorkspaces();
  const { mutate: createProject, isPending: creatingProject } =
    useCreateProject();
  const { mutate: updateProject, isPending: updatingProject } =
    useUpdateProject();

  const isEditMode = !!project;
  // const isPending = creatingProject || updatingProject;

  const activeWorkspaceId =
    manualWorkspaceId ?? (project?.workspaceId || workspaces?.[0]?.id || "");
  const activeWorkspace =
    workspaces?.find((w) => w.id === activeWorkspaceId) || null;

  const selectedIcon =
    PROJECT_ICONS.find((item) => item.value === icon) || PROJECT_ICONS[0];
  const CurrentIcon = selectedIcon.Icon;

  // 2. TREAT BOTH SUBMITS
  const handleSubmit = () => {
    if (!name || !activeWorkspace || !icon) return;

    const payload = {
      name,
      description,
      icon,
    };

    if (isEditMode) {
      const updatePayload = {
        ...payload,
        projectId: project.id,
        workspaceId: activeWorkspace.id,
        workspaceSlug: activeWorkspace.slug,
      };
      updateProject(
        {
          projectSlug: project.slug,
          data: updatePayload,
        },
        {
          onSuccess: () => handleCloseModal(),
        },
      );
    } else {
      createProject(
        {
          ...payload,
          workspaceId: activeWorkspace.id,
          workspaceSlug: activeWorkspace.slug,
        },
        {
          onSuccess: () => handleCloseModal(),
        },
      );
    }
  };

  const handleCloseModal = () => {
    onClose();
    setShowIconPicker(false);
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 backdrop-blur-sm px-4 animate-in fade-in duration-200"
        onClick={(e) => {
          e.stopPropagation();
          handleCloseModal();
        }}
      >
        {/* Modal Container */}
        <div
          className="relative flex w-112.5 max-w-lg flex-col rounded-xl border border-md bg-surface shadow-soft animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-muted transition-colors hover:text-primary focus-ring rounded-sm p-1"
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col items-start">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-md bg-accent-dim text-accent">
                <AlignLeft size={18} strokeWidth={1.5} />
              </div>

              <h1 className="heading-md mb-1.5 text-primary">
                {project ? "EditProject" : "New Project"}
              </h1>

              {!project && (
                <p className="text-sm leading-relaxed text-secondary pr-6">
                  Projects contain boards, columns, and cards for your
                  team&apos;s work.
                </p>
              )}
            </div>

            <div className="space-y-5">
              {/* Row: Icon Picker & Name */}
              <div className="flex items-start gap-4">
                {/* Icon Picker */}
                <div className="relative" ref={iconPickerRef}>
                  <div className="mb-1.5 flex gap-1 text-sm font-semibold text-primary">
                    Icon
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowIconPicker((prev) => !prev)}
                    className="input-premium flex h-10 w-10 items-center justify-center focus-ring hover:bg-overlay"
                  >
                    <CurrentIcon size={18} strokeWidth={1.8} />
                  </button>

                  {showIconPicker && (
                    <div className="absolute left-0 top-13 z-50 w-56 rounded-xl border border-md bg-surface p-2 shadow-soft animate-in fade-in zoom-in-95 duration-150">
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
                              className={`relative flex h-10 w-10 items-center justify-center rounded-lg border transition-colors focus-ring ${
                                active
                                  ? "border-accent bg-accent-dim text-accent"
                                  : "border-md bg-card text-muted hover:border-lg hover:text-primary hover:bg-overlay"
                              }`}
                            >
                              <ActiveIcon size={18} strokeWidth={1.8} />

                              {active && (
                                <Check
                                  size={11}
                                  strokeWidth={3}
                                  className="absolute right-1 top-1 text-accent"
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
                  <div className="mb-1.5 flex gap-1 text-sm font-semibold text-primary">
                    Project name
                    <span className="text-danger">*</span>
                  </div>

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Design System"
                    autoFocus
                    className="input-premium h-10 w-full px-3 text-sm focus-ring"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="mb-1.5 flex gap-1 text-sm font-semibold text-primary">
                  Description
                </div>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What is this project about?"
                  className="input-premium w-full resize-none p-3 text-sm focus-ring"
                />
              </div>

              {/* Workspace */}
              <div>
                <div className="mb-1.5 flex gap-1 text-sm font-semibold text-primary">
                  Workspace
                </div>

                <div className="relative">
                  <select
                    value={activeWorkspaceId}
                    onChange={(e) => setManualWorkspaceId(e.target.value)}
                    disabled={workspacesLoading || !workspaces?.length}
                    className="input-premium h-10 w-full appearance-none px-3 text-sm focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-md bg-surface px-6 py-4 rounded-b-xl">
            <button
              onClick={handleCloseModal}
              className="btn-ghost h-9 px-4 text-sm font-medium focus-ring"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={
                !name.trim() ||
                creatingProject ||
                workspacesLoading ||
                updatingProject
              }
              className="btn-primary flex h-9 items-center gap-2 px-4 text-sm font-semibold focus-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {project ? (
                <Check size={14} strokeWidth={2} />
              ) : (
                <Plus size={14} strokeWidth={2} />
              )}

              {project ? "Save changes" : "Create project"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
