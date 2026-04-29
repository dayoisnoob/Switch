import { api } from "@/lib/api";

export type WorkspaceRole = "owner" | "admin" | "member";

export interface WorkspaceMembers {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  role: string;
  userId: string;
}
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  role: WorkspaceRole;
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
