import { create } from "zustand";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  role: "owner" | "admin" | "member";
}

interface WorkspaceStore {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;

  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (workspace: Workspace) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  loading: true,

  setWorkspaces: (workspaces) => set({ workspaces, loading: false }),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
}));
