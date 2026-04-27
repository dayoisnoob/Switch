import {
  WorkspaceMembers,
  WorkspaceService,
} from "@/services/workspace.service";
import { WorkspaceRole } from "@/types";
import { create } from "zustand";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  role: WorkspaceRole;
}

interface WorkspaceStore {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  workspaceMembers: WorkspaceMembers[];
  loading: boolean;
  membersLoading: boolean;

  setWorkspaces: (workspaces: Workspace[]) => void;
  setWorkspaceMembers: (members: WorkspaceMembers[]) => void;
  setActiveWorkspace: (workspace: Workspace) => void;
  syncMembers: (slug: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  workspaceMembers: [],
  loading: true,
  membersLoading: false,

  setWorkspaces: (workspaces) => set({ workspaces, loading: false }),
  setWorkspaceMembers: (members) => set({ workspaceMembers: members }),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  syncMembers: async (slug: string) => {
    set({ membersLoading: true }); // Start loading
    try {
      const members = await WorkspaceService.getMembers(slug);
      set({ workspaceMembers: members, membersLoading: false });
    } catch (err) {
      console.error("Failed to sync members", err);
      set({ membersLoading: false });
    }
  },
}));
