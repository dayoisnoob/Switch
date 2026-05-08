import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface SendInvite {
  email: string;
  role: string;
}

export interface AcceptInviteData {
  requiresRegistration: boolean;
  requiresLogin: boolean;
  workspaceSlug: string;
  token?: string;
}

export interface PendingInvites {
  id: string;
  email: string;
  invitedBy: string;
  role: string;
  createdAt: string;
}
export interface VerifyInvitation {
  workspaceName: string;
  workspaceSlug: string;
  inviterName: string;
  email: string;
}

export function useSendInvite(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendInvite) =>
      api.post(`/workspaces/${workspaceSlug}/invitations`, data),

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

export const useGetPendingInvites = (
  workspaceSlug?: string,
  isOpen: boolean = true,
) => {
  return useQuery({
    queryKey: ["invitations", workspaceSlug],
    queryFn: (): Promise<PendingInvites[]> =>
      api.get(`/workspaces/${workspaceSlug}/invitations/pending`),
    enabled: !!workspaceSlug && isOpen,
    staleTime: 1000 * 60 * 5,
  });
};

export function useRevokeInvite(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) =>
      api.delete(`/workspaces/${workspaceSlug}/invitations/${email}`),

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
      api.post(`/workspaces/${workspaceSlug}/invitations/resend`, {
        email,
      }),

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

export function useVerifyInvite(token: string | null) {
  return useQuery({
    queryKey: ["verify-invite", token],
    queryFn: (): Promise<VerifyInvitation> =>
      api.get(`/invitations/verify/${token}`),
    enabled: !!token,
    retry: false,
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      return api.post(
        `/invitations/accept/${token}`,
      ) as Promise<AcceptInviteData>;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },

    onError: (err) => {
      const message = getErrorMessage(err);
      toast.error(message || "Failed to accept invite");
    },
  });
}
