import { api } from "@/lib/api";

export type WorkspaceRole = "owner" | "admin" | "member";

export interface WorkspaceMembers {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  role: "Owner" | "Admin" | "Member";
  joinedAt: string;
  userId: string;
}
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  role: WorkspaceRole;
  colour: string;
  projectsCount: number;
  membersCount: number;
  members: [
    {
      name: string;
      avatarUrl: string | null;
    },
  ];
}

export interface CreateWP {
  name: string;
  slug: string;
  colour: string;
}

export const WorkspaceService = {
  getWorkspaces: async (): Promise<Workspace[]> => {
    return api.get("/workspaces");
  },

  createWorkspace: async (data: CreateWP): Promise<Workspace> => {
    return api.post("/workspaces", data);
  },

  getMembers: async (workspaceSlug: string): Promise<WorkspaceMembers[]> => {
    return api.get(`/workspaces/${workspaceSlug}/members`);
  },
};
