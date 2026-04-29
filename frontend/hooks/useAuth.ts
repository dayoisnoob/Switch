import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((s) => s.clearUser);

  return async () => {
    await AuthService.logout();
    clearUser();
    queryClient.clear();
    router.replace("/login");
  };
};

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    staleTime: Infinity,
    queryFn: () => AuthService.getCurrentUser(),
  });
}

export function useTeammates() {
  return useQuery({
    queryKey: ["teammates"],
    queryFn: () => AuthService.getUserTeamMembers(),
    staleTime: 1000 * 60 * 5,
  });
}
