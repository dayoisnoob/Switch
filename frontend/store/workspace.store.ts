import { Workspace } from "@/services/workspace.service";
import { create } from "zustand";

interface WorkspaceStore {
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  activeWorkspace: null,
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
}));
