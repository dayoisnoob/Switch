import { FormValues } from "@/app/(auth)/register/onboarding/page";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface CompleteUserData extends FormValues {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
}

export interface TeammatesCountResponse {
  count: number;
}

export function useInitialiseReg() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, token }: { email: string; token?: string }) =>
      api.post("/auth/register/initialise", { email }),

    onSuccess: (res, { email, token }) => {
      router.push(
        `/register/verify?email=${encodeURIComponent(email)}&status=${res.status || "success"}${token ? `&inviteToken=${token}` : ""}`,
      );
    },

    onError: (err) => {
      const message = getErrorMessage(err);
      toast.error(message);
    },
  });
}

export function useVerifyReg() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { email: string; code: string; token?: string }) =>
      api.post("/auth/register/verify-otp", data),

    onSuccess: (_, variables) => {
      toast.success("Email verified!");
      router.push(
        `/register/onboarding?email=${encodeURIComponent(variables.email)}${variables.token ? `&inviteToken=${variables.token}` : ""}`,
      );
    },

    onError: (err) => {
      const message = getErrorMessage(err);
      toast.error(message);
    },
  });
}
export function useResendOtp() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post("/auth/register/resend-otp", { email }),

    onSuccess: () => {
      toast.success("otp resent!");
    },

    onError: (err) => {
      const message = getErrorMessage(err);
      toast.error(message);
    },
  });
}

export function useCompleteReg() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CompleteUserData) =>
      api.patch("/auth/register/onboarding", data),
    onSuccess: () => {
      router.push("/getting-started");
    },

    onError: (err) => {
      const message = getErrorMessage(err);
      toast.error(message);
    },
  });
}

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => api.post("/auth/login", data),

    onSuccess: () => {
      router.push("/dashboard");
    },

    onError: async (err, variables) => {
      const message = getErrorMessage(err);

      const isUnverifiedError = message
        .toLowerCase()
        .includes("verify your email");

      const isIncompleteRegError = message
        .toLowerCase()
        .includes("complete your registration");

      if (isUnverifiedError) {
        toast.info("Please verify your email. Sending a new code...");

        try {
          await api.post("/auth/register/resend-otp", {
            email: variables.email,
          });

          router.push(
            `/register/verify?email=${encodeURIComponent(variables.email)}`,
          );
        } catch (resendErr) {
          toast.error(
            "Failed to send verification code. Please try signing up again.",
          );
        }

        return;
      }

      if (isIncompleteRegError) {
        toast.info("Please complete your registration");

        router.push(
          `/register/onboarding?email=${encodeURIComponent(variables.email)}`,
        );

        return;
      }

      toast.error(message);
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    staleTime: Infinity,
    queryFn: (): Promise<UserProfile> => api.get("/users/me"),
  });
}

export function useTeammates() {
  return useQuery({
    queryKey: ["teammates"],
    queryFn: (): Promise<TeammatesCountResponse> =>
      api.get("/users/me/teammates/count"),
    staleTime: 1000 * 60 * 5,
  });
}

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((s) => s.clearUser);

  return async () => {
    await api.post("/auth/logout");
    clearUser();
    queryClient.clear();
    router.replace("/login");
  };
};
