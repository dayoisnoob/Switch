"use client";

import { useState } from "react";
import { AuthInput, PrimaryButton } from "@/components/auth/auth-components";
import { slugify } from "@/lib/utils";
import { useCreateWorkspace } from "@/hooks/useCreateWorkspace";

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");

  const { createWorkspace, loading } = useCreateWorkspace(onClose);

  if (!isOpen) return null;

  const handleCreate = async () => createWorkspace(name);

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-[#0b0e14]/80 backdrop-blur-md px-4">
      <div className="w-full max-w-120 border bg-[#1c1728]/50 border-[#2d2a35] rounded-2xl p-10 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#f0f6fc] mb-3 tracking-tight">
            Create your workspace
          </h1>
          <p className="text-[15px] text-[#8b949e] leading-relaxed">
            Workspaces are where your projects live. Give it a name to get
            started.
          </p>
        </div>

        <div className="relative space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider">
              Workspace Name
            </label>

            <button className="absolute top-3">X</button>

            <AuthInput
              placeholder="e.g. Acme Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="bg-[#24222a] border-[#3a3742] h-12"
            />
          </div>

          <div className="bg-[#0f0e13] border border-[#24222a] rounded-lg px-4 py-3">
            <p className="text-sm text-[#484f58]">
              switch.app/
              <span className="text-white/75">
                {name ? slugify(name) : "your-workspace"}
              </span>
            </p>
          </div>

          <PrimaryButton
            onClick={handleCreate}
            loading={loading}
            disabled={!name.trim() || loading}
            className="h-12 bg-[#1c1a24] border border-[#3a3742] hover:bg-[#24222a] text-white font-semibold transition-all"
          >
            Create workspace
          </PrimaryButton>

          <p className="text-center text-xs text-white/75 pt-2">
            You can rename or add more workspaces later
          </p>
        </div>
      </div>
    </div>
  );
}
