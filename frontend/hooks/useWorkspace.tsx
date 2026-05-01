import { getErrorMessage } from "@/lib/utils";
import {
  CreateWP,
  SendInvite,
  UpdateWp,
  WorkspaceService,
} from "@/services/workspace.service";
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

export function useUpdateWorkspace(workspaceSlug: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateWp) =>
      WorkspaceService.updateWorkspace(workspaceSlug, data),

    onSuccess: (updatedWorkspace) => {
      toast.success("Workspace Updated");
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });

      if (updatedWorkspace?.slug && updatedWorkspace.slug !== workspaceSlug) {
        router.push(`/${updatedWorkspace.slug}?tab=settings`);
      }
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export const useGetMembers = (workspaceSlug?: string) => {
  return useQuery({
    queryKey: ["members", workspaceSlug],
    queryFn: () => WorkspaceService.getMembers(workspaceSlug!),
    enabled: !!workspaceSlug,
    staleTime: 1000 * 60 * 5,
  });
};

export function useSendInvite(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendInvite) =>
      WorkspaceService.sendInvite(workspaceSlug, data),

    onSuccess: () => {
      toast.success("Invitation sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },

    onError: (err) => {
      const message = getErrorMessage(err);
      toast.error(message);
    },
  });
}

export const useGetPendingInvites = (workspaceSlug?: string) => {
  return useQuery({
    queryKey: ["invitations", workspaceSlug],
    queryFn: () => WorkspaceService.getPendingInvites(workspaceSlug!),
    enabled: !!workspaceSlug,
    staleTime: 1000 * 60 * 5,
  });
};

export function useRevokeInvite(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) =>
      WorkspaceService.revokeInvite(workspaceSlug, email),

    onSuccess: () => {
      toast.success("Invitation revoked");
      queryClient.invalidateQueries({
        queryKey: ["invitations", workspaceSlug],
      });
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useResendInvite(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) =>
      WorkspaceService.resendInvite(workspaceSlug, email),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invitations", workspaceSlug],
      });
      toast.success("Invitation resent successfully!");
    },

    onError: (err) => {
      const message = getErrorMessage(err);
      toast.error(message);
    },
  });
}

export function useRemoveMember(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) =>
      WorkspaceService.removeMember(workspaceSlug, userId),

    onSuccess: () => {
      toast.success("User removed");
      queryClient.invalidateQueries({
        queryKey: ["members", workspaceSlug],
      });
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}

export function useDeleteWorkspace(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => WorkspaceService.deleteWorkspace(workspaceSlug),

    onSuccess: () => {
      toast.success("Workspace deleted");
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
