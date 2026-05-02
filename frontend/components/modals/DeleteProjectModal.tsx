"use client";

import { Portal } from "@/components/ui/Portal";
import { Project } from "@/services/projects.service";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { PROJECT_ICON_MAP } from "./CreateProjectModal";
import { cn } from "@/lib/utils";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onDelete: (projectId: string) => void;
  isDeleting?: boolean;
}

export default function DeleteProjectModal({
  isOpen,
  onClose,
  project,
  onDelete,
  isDeleting,
}: DeleteProjectModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const Icon = PROJECT_ICON_MAP[project.icon] || Trash2;

  if (!isOpen) return null;

  const isConfirmed = confirmText === project.name;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[440px] bg-[#0A0A0A] border border-white/[0.08] rounded-2xl shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="p-6">
            {/* Header Icon */}
            <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center mb-4 shadow-sm">
              <Trash2 size={18} className="text-rose-500" />
            </div>

            <div className="mb-6">
              <h1 className="text-xl font-bold text-white mb-1 tracking-tight">
                Delete project
              </h1>
              <p className="text-[13px] text-white/40 leading-relaxed">
                This will permanently delete the project and all its data.
              </p>
            </div>

            {/* Project Preview Card */}
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#111115] flex items-center justify-center text-xl">
                <Icon size={20} className="text-white/70" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white/90">
                  {project.name}
                </span>
                <span className="text-[11px] text-white/30 uppercase tracking-wider font-bold">
                  {project.cardsCount || 0} cards ·{" "}
                  {(project.assignees && project.assignees.length) || 0} members
                </span>
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 flex gap-3 mb-6">
              <AlertTriangle
                size={18}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-bold text-rose-500">
                  All data will be lost
                </span>
                <p className="text-[12px] text-rose-500/60 leading-relaxed">
                  All cards, comments, attachments, and activity will be
                  permanently deleted. This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-3">
              <p className="text-[12px] text-white/40">
                Type{" "}
                <span className="text-rose-500 font-mono bg-rose-500/10 px-1.5 py-0.5 rounded">
                  {project.name}
                </span>{" "}
                to confirm deletion.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={project.name}
                autoFocus
                className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-rose-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/10 outline-none transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-[#050505] border-t border-white/[0.05] flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-semibold text-white/40 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!isConfirmed || isDeleting}
              onClick={() => onDelete(project.id)}
              className={cn(
                "px-5 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2",
                isConfirmed && !isDeleting
                  ? "bg-rose-500 text-white hover:bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                  : "bg-white/5 text-white/20 cursor-not-allowed",
              )}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete project"
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
