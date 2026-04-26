import { api } from "@/lib/api";
import { Workspace } from "@/types";

export interface WorkspaceMembers {
  id: string;
  email: string;
  role: string;
  joinedAt: string;
}

export const WorkspaceService = {
  getWorkspaces: async (): Promise<Workspace[]> => {
    return api.get("/workspaces");
  },

  createWorkspace: async (name: string): Promise<Workspace> => {
    return api.post("/workspaces", { name });
  },

  getMembers: async (workspaceId: string): Promise<WorkspaceMembers[]> => {
    return api.get(`/workspaces/${workspaceId}/members`);
  },
};
