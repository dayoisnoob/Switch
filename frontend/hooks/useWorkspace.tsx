import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace.store";
import { BoardAssignee } from "@/types/board.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMe } from "./useAuth";

export type WorkspaceRole = "Owner" | "Admin" | "Member";

export interface WorkspaceMembers {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  role: WorkspaceRole;
  joinedAt: string;
  userId: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  role: WorkspaceRole;
  colour: string;
  projectsCount: number;
  membersCount: number;
  members: BoardAssignee[];
}

export interface CreateWorkspace {
  name: string;
  slug: string;
  colour: string;
}

export interface UpdateWorkspace {
  name?: string;
  slug?: string;
}

export function useCreateWorkspace() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

  return useMutation({
    mutationFn: async (data: CreateWorkspace): Promise<Workspace> =>
      api.post("/workspaces", data),

    onSuccess: (workspace) => {
      queryClient.setQueryData(["workspaces"], (old: Workspace[] = []) => [
        ...old,
        workspace,
      ]);

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
    queryFn: (): Promise<Workspace[]> => api.get("/workspaces"),
    staleTime: 1000 * 60 * 5,
  });
};

export function useUpdateWorkspace(workspaceSlug: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: UpdateWorkspace,
    ): Promise<{ name: string; slug: string }> =>
      api.patch(`/workspaces/${workspaceSlug}`, data),

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

export const useGetMembers = (workspaceSlug: string) => {
  return useQuery({
    queryKey: ["members", workspaceSlug],
    queryFn: (): Promise<WorkspaceMembers[]> =>
      api.get(`/workspaces/${workspaceSlug}/members`),
    enabled: !!workspaceSlug,
    staleTime: 1000 * 60 * 5,
  });
};

export function useRemoveMember(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) =>
      api.delete(`/workspaces/${workspaceSlug}/members/${userId}`),

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
    mutationFn: async () => api.delete(`/workspaces/${workspaceSlug}`),

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

export function useWorkspaceRole(workspaceSlug: string) {
  const { data: currentUser } = useMe();
  const { data: workspaceMembers } = useGetMembers(workspaceSlug);

  const currentMember = workspaceMembers?.find(
    (m) => m.userId === currentUser?.id,
  );

  const role = currentMember?.role ?? "Member";

  return {
    role,
    isOwner: role === "Owner",
    isAdmin: role === "Admin",
    canManageWorkspace: ["Owner", "Admin"].includes(role),
  };
}

export function useUpdateMemberRole(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "Admin" | "Member";
    }) => api.patch(`/workspaces/${workspaceSlug}/members/${userId}`, { role }),

    onSuccess: () => {
      toast.success("Member role successfully updated");
      queryClient.invalidateQueries({
        queryKey: ["members", workspaceSlug],
      });
    },

    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });
}
