import { api } from "@/lib/api";
import { ApiResponse } from "@/types";
import { WorkspaceRole } from "./workspace.service";

export const AuthService = {
  logout: async () => {
    return api.post("/auth/logout");
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    return api.get("/users/me");
  },

  getUserTeamMembers: async (): Promise<{ count: number }> => {
    return api.get("/users/me/teammates/count");
  },
};

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
