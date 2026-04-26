"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AuthInput, PrimaryButton } from "@/components/auth/auth-components";
import { slugify } from "@/lib/utils";
import { useCreateWorkspace } from "@/hooks/useCreateWorkspace";

interface AddWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddWorkspaceModal({
  isOpen,
  onClose,
}: AddWorkspaceModalProps) {
  const [name, setName] = useState("");

  const { createWorkspace, loading } = useCreateWorkspace(() => {
    setName("");
    onClose();
  });

  const handleCreate = () => createWorkspace(name);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-[2px] p-4 transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-110 bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#30363d] flex justify-between items-center bg-[#161b22]">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-[#f0f6fc]">
              Create Workspace
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#f0f6fc] transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#8b949e] uppercase tracking-widest">
              Workspace Name
            </label>
            <AuthInput
              placeholder="e.g. Acme Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className=""
            />
          </div>

          <div className="bg-[#0b0e14] border border-[#30363d] rounded-lg px-4 py-3 flex items-center gap-2">
            <p className="text-sm text-[#484f58]">
              switch.app/
              <span className="text-white/75">
                {name ? slugify(name) : "your-workspace"}
              </span>
            </p>
          </div>

          <p className="text-xs text-[#8b949e] leading-relaxed">
            This workspace will be your team&apos;s shared space for projects
            and boards. You can invite members once created.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 h-10 text-xs font-semibold text-[#c9d1d9] hover:bg-[#21262d] rounded-md border border-[#30363d] transition-colors"
            >
              Cancel
            </button>
            <PrimaryButton
              onClick={handleCreate}
              loading={loading}
              disabled={!name.trim() || loading}
              className="flex-1 h-10 bg-[#238636] hover:bg-[#2ea043] border-transparent text-white text-xs font-semibold"
            >
              Create Workspace
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
