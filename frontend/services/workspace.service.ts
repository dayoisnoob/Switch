import { api } from "@/lib/api";
import { Workspace } from "@/types";

export interface WorkspaceMembers {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  role: string;
  userId: string;
}

export const WorkspaceService = {
  getWorkspaces: async (): Promise<Workspace[]> => {
    return api.get("/workspaces");
  },

  createWorkspace: async (name: string): Promise<Workspace> => {
    return api.post("/workspaces", { name });
  },

  getMembers: async (workspaceSlug: string): Promise<WorkspaceMembers[]> => {
    return api.get(`/workspaces/${workspaceSlug}/members`);
  },
};
