import { Workspace } from "@/services/workspace.service";
import React from "react";

interface SettingsTab {
  activeWorkspace: Workspace;
}

const SettingsTab = ({ activeWorkspace }: SettingsTab) => {
  return (
    <div className="animate-in fade-in duration-300 max-w-2xl">
      {/* General Settings Card */}
      <div className="bg-[#1C1C1E] border border-[#2a2a2a] rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="text-base font-bold text-white mb-5">General</h2>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#a1a1a1] mb-2">
              Workspace Name
            </label>
            <input
              type="text"
              defaultValue={activeWorkspace.name}
              className="w-full h-10 bg-[#151517] border border-[#2a2a2a] rounded-md px-3 text-sm text-white focus:outline-none focus:border-[#7C6EF5] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a1a1a1] mb-2">
              Slug
            </label>
            <input
              type="text"
              defaultValue={activeWorkspace.slug}
              className="w-full h-10 bg-[#151517] border border-[#7C6EF5] rounded-md px-3 text-sm text-white focus:outline-none transition-colors shadow-[0_0_0_1px_rgba(124,110,245,0.2)]"
            />
          </div>

          <button className="h-9 px-4 mt-2 bg-[#7C6EF5] hover:bg-[#6b5ee6] text-white rounded-md text-sm font-semibold transition-all shadow-sm">
            Save Changes
          </button>
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="bg-[#1C1C1E] border border-red-900/50 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-red-500 mb-2">Danger Zone</h2>
        <p className="text-sm text-[#a1a1a1] mb-5">
          Deleting your workspace is permanent. All projects, boards, and cards
          will be lost.
        </p>

        <button className="h-9 px-4 bg-transparent border border-red-900/60 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 rounded-md text-sm font-semibold transition-all">
          Delete Workspace
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
