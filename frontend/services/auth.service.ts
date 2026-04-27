import { api } from "@/lib/api";
import { ApiResponse, WorkspaceRole } from "@/types";
import { CompleteUserData, LoginRequest } from "@/types/auth.types";

export const AuthService = {
  initialiseRegistration: async (email: string): Promise<ApiResponse> => {
    return api.post("/auth/register/initialise", { email });
  },

  verifyLoginOtp: async (email: string, code: string): Promise<ApiResponse> => {
    return api.post("/auth/register/verify-otp", { email, code });
  },

  completeRegistration: async (
    data: CompleteUserData,
  ): Promise<ApiResponse> => {
    return api.patch("/auth/register/onboarding", data);
  },

  resendOtp: async (email: string): Promise<ApiResponse> => {
    return api.post("/auth/register/resend-otp", { email });
  },

  login: async (data: LoginRequest): Promise<ApiResponse> => {
    return api.post("/auth/login", data);
  },

  logout: async () => {
    return api.post("/auth/logout");
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    return api.get("/auth/me");
  },
};

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  role: WorkspaceRole;
}
