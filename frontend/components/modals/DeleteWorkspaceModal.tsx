"use client";

import { useDeleteWorkspace, Workspace } from "@/hooks/useWorkspace";
import { cn } from "@/lib/utils";
import { AlertTriangle, LayoutGrid, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Portal } from "../ui/Portal";

interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace | null;
  projectCount?: number;
  memberCount?: number;
}

export default function DeleteWorkspaceModal({
  isOpen,
  onClose,
  workspace,
  projectCount = 0,
  memberCount = 0,
}: DeleteWorkspaceModalProps) {
  const router = useRouter();

  const [confirmInput, setConfirmInput] = useState("");
  const { mutate: deleteWorkspace, isPending } = useDeleteWorkspace(
    workspace!.slug,
  );

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setConfirmInput(""), 200);
    } else {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !workspace) return null;

  const isMatch = confirmInput === workspace.slug;

  const handleDeleteWorkspace = () => {
    if (!isMatch) return;
    deleteWorkspace();
    router.push("/dashboard");
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-125 bg-[#151517] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            disabled={isPending}
            className="absolute top-4 right-4 text-[#a1a1a1] hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>

          <div className="p-6">
            <div className="w-10 h-10 rounded-xl bg-[#3f1c22] text-[#ef4444] flex items-center justify-center mb-5 border border-[#3f1c22]">
              <LayoutGrid size={20} />
            </div>

            <h2 className="text-xl font-bold text-white mb-1.5 tracking-tight">
              Delete workspace
            </h2>
            <p className="text-[13px] text-[#8a8a93] mb-6 leading-relaxed">
              Permanently deletes the workspace, all projects, boards, cards,
              and member access.
            </p>

            <div className="bg-[#1C1C1E] border border-[#2a2a2a] rounded-xl p-4 mb-4 flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black text-white shrink-0",
                  workspace.colour || "bg-[#7C6EF5]",
                )}
              >
                {workspace.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate">
                  {workspace.name}
                </span>
                <span className="text-[13px] text-[#8a8a93] truncate mt-0.5">
                  {projectCount} projects · {memberCount} members
                </span>
              </div>
            </div>

            <div className="bg-[#2a1318]/80 border border-[#7f1d1d]/40 rounded-xl p-4 mb-4 flex gap-3 items-start">
              <AlertTriangle
                size={16}
                className="text-[#ef4444] shrink-0 mt-0.5"
              />
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#ef4444] mb-1">
                  This is irreversible
                </span>
                <p className="text-[13px] text-[#a1a1aa] leading-relaxed">
                  All {projectCount} projects, attachments, comments, and member
                  access will be permanently deleted. Billing will stop
                  immediately. There is no way to recover this workspace.
                </p>
              </div>
            </div>

            <div className="bg-[#1C1C1E] border border-[#2a2a2a] rounded-xl p-4 mb-8">
              <label className="block text-[13px] text-[#8a8a93] mb-3 leading-relaxed">
                Type{" "}
                <span className="bg-[#3f1c22] text-[#ef4444] px-1.5 py-0.5 rounded font-mono text-xs">
                  {workspace.slug}
                </span>{" "}
                to confirm. This will immediately revoke access for all{" "}
                {memberCount} members.
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={workspace.slug}
                className="w-full h-10 bg-[#151517] border border-[#2a2a2a] rounded-md px-3 text-sm text-white placeholder:text-[#404040] focus:outline-none focus:border-[#ef4444] transition-colors shadow-[0_0_0_1px_rgba(239,68,68,0.1)] focus:shadow-[0_0_0_1px_rgba(239,68,68,0.3)]"
                autoComplete="off"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isPending}
                className="px-4 h-10 rounded-lg text-sm font-semibold text-white bg-transparent border border-[#2a2a2a] hover:bg-[#252529] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteWorkspace}
                disabled={isPending || !isMatch}
                className="px-4 h-10 rounded-lg text-sm font-semibold text-[#ef4444] bg-[#3f1c22] border border-[#7f1d1d]/50 hover:bg-[#4c1d28] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Deleting..." : "Delete workspace forever"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
