import { getErrorMessage } from "@/lib/utils";
import { CreateWP, WorkspaceService } from "@/services/workspace.service";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useCreateWorkspace() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  return useMutation({
    mutationFn: async (data: CreateWP) =>
      WorkspaceService.createWorkspace(data),

    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      console.log(workspace);
      setActiveWorkspace(workspace);

      router.push(`/dashboard`);
    },

    onError: (err) => {
      const message = getErrorMessage(err);
      toast.error(message);
    },
  });
}

export const useGetWorkspaces = () => {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => WorkspaceService.getWorkspaces(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetMembers = (workspaceSlug?: string) => {
  return useQuery({
    queryKey: ["members", workspaceSlug],
    queryFn: () => WorkspaceService.getMembers(workspaceSlug!),
    enabled: !!workspaceSlug,
    staleTime: 1000 * 60 * 5,
  });
};
