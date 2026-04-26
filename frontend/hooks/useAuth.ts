import { AuthService } from "@/services/auth.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    await AuthService.logout();
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
