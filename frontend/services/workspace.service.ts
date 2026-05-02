import { api } from "@/lib/api";
import { BoardAssignee } from "@/types/board.types";

export type WorkspaceRole = "Owner" | "Admin" | "Member";

export interface WorkspaceMembers {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  role: WorkspaceRole;
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
  members: BoardAssignee[];
}

export interface CreateWP {
  name: string;
  slug: string;
  colour: string;
}
export interface SendInvite {
  email: string;
  role: string;
}

export interface PendingInvites {
  id: string;
  email: string;
  invitedBy: string;
  role: string;
  createdAt: string;
}

export interface UpdateWp {
  name?: string;
  slug?: string;
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

  removeMember: async (workspaceSlug: string, userId: string) => {
    return api.delete(`/workspaces/${workspaceSlug}/members/${userId}`);
  },

  sendInvite: async (workspaceSlug: string, data: SendInvite) => {
    return api.post(`/workspaces/${workspaceSlug}/invitations`, data);
  },

  revokeInvite: async (workspaceSlug: string, email: string) => {
    return api.delete(`/workspaces/${workspaceSlug}/invitations/${email}`);
  },

  getPendingInvites: async (
    workspaceSlug: string,
  ): Promise<PendingInvites[]> => {
    return api.get(`/workspaces/${workspaceSlug}/invitations`);
  },

  resendInvite: async (workspaceSlug: string, email: string) => {
    return api.post(`/workspaces/${workspaceSlug}/invitations/resend`, {
      email,
    });
  },

  updateWorkspace: async (
    workspaceSlug: string,
    data: UpdateWp,
  ): Promise<{ name: string; slug: string }> => {
    return api.patch(`/workspaces/${workspaceSlug}`, data);
  },

  deleteWorkspace: async (workspaceSlug: string) => {
    return api.delete(`/workspaces/${workspaceSlug}`);
  },
};
