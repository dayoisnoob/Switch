import { getErrorMessage } from "@/lib/utils";
import { WorkspaceService } from "@/services/workspace.service";
import { useWorkspaceStore } from "@/store/workspace.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useCreateWorkspace(onSuccessCallback?: () => void) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  return useMutation({
    mutationFn: async (name: string) => {
      if (!name.trim()) throw new Error("Workspace name is required");
      return WorkspaceService.createWorkspace(name);
    },

    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      setActiveWorkspace(workspace);

      if (onSuccessCallback) onSuccessCallback();

      router.push(`/workspace/${workspace.slug}`);
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
