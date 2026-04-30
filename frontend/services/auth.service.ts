import { api } from "@/lib/api";
import { ApiResponse } from "@/types";
import { WorkspaceRole } from "./workspace.service";

export const AuthService = {
  initialiseRegistration: async (email: string): Promise<ApiResponse> => {
    return api.post("/auth/register/initialise", { email });
  },

  verifyLoginOtp: async (email: string, code: string): Promise<ApiResponse> => {
    return api.post("/auth/register/verify-otp", { email, code });
  },

  completeRegistration: async (
    data: CompleteUserData,
  ): Promise<UserProfile> => {
    return api.patch("/auth/register/onboarding", data);
  },

  resendOtp: async (email: string): Promise<ApiResponse> => {
    return api.post("/auth/register/resend-otp", { email });
  },

  login: async (data: LoginRequest): Promise<UserProfile> => {
    return api.post("/auth/login", data);
  },

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

export interface FormValues {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

export interface CompleteUserData extends FormValues {
  email: string;
}
