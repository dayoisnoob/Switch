import { useUpdateWorkspace } from "@/hooks/useWorkspace";
import { Workspace } from "@/services/workspace.service";
import { useState } from "react";

interface SettingsTab {
  activeWorkspace: Workspace;
  onOpenDeleteModal: () => void;
}

export const SettingsTab = ({
  activeWorkspace,
  onOpenDeleteModal,
}: SettingsTab) => {
  const [name, setName] = useState(activeWorkspace?.name || "");
  const [slug, setSlug] = useState(activeWorkspace?.slug || "");

  const hasNameChanged = name.trim() !== activeWorkspace?.name;
  const hasSlugChanged = slug.trim() !== activeWorkspace?.slug;
  const hasChanges = hasNameChanged || hasSlugChanged;

  const { mutate: updateWorkspace, isPending } = useUpdateWorkspace(
    activeWorkspace.slug,
  );

  const handleUpdate = async () => {
    if (!name.trim() || !slug.trim() || !hasChanges) return;

    const payload: { name?: string; slug?: string } = {};
    if (hasNameChanged) payload.name = name.trim();
    if (hasSlugChanged) payload.slug = slug.trim();

    console.log("Sending optimized payload:", payload);
    updateWorkspace(payload);
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="bg-[#1C1C1E] border border-[#2a2a2a] rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="text-base font-bold text-white mb-5">General</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#a1a1a1] mb-2">
              Workspace Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 bg-[#151517] border border-[#2a2a2a] rounded-md px-3 text-sm text-white focus:outline-none focus:border-[#7C6EF5] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a1a1a1] mb-2">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full h-10 bg-[#151517] border border-[#7C6EF5] rounded-md px-3 text-sm text-white focus:outline-none transition-colors shadow-[0_0_0_1px_rgba(124,110,245,0.2)]"
            />
          </div>

          <button
            onClick={handleUpdate}
            disabled={isPending || !name.trim() || !slug.trim() || !hasChanges}
            className="h-9 px-4 mt-2 bg-[#7C6EF5] hover:bg-[#6b5ee6] text-white rounded-md text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-30"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-[#1C1C1E] border border-[#7f1d1d]/30 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#ef4444] mb-2">Danger Zone</h2>
        <p className="text-sm text-[#8a8a93] mb-5">
          Permanently delete this workspace and all of its data. This action
          cannot be undone.
        </p>
        <button
          onClick={onOpenDeleteModal}
          className="h-9 px-4 bg-[#3f1c22] hover:bg-[#4c1d28] text-[#ef4444] border border-[#7f1d1d]/50 rounded-md text-sm font-semibold transition-all"
        >
          Delete Workspace
        </button>
      </div>
    </div>
  );
};
