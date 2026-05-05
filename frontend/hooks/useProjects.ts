import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { CreateProject, ProjectService } from "@/services/projects.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  status: string;
  icon: string;
  description: string;
  createdBy: string;
  cardsCount: number;
  finishedCards: number;
  assignees: {
    firstName: string;
    avatarUrl: string | null;
  }[];
}

export function useCreateProject() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProject) => ProjectService.create(data),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push(`/${variables.workspaceSlug}/${data.slug}`);
    },

    onError: (err) => {
      const message = getErrorMessage(err);
      toast.error(message);
    },
  });
}

export function useWorkspaceProjects(workspaceSlug?: string) {
  return useQuery({
    queryKey: ["projects", workspaceSlug],
    queryFn: (): Promise<Project[]> =>
      api.get(`/workspaces/${workspaceSlug}/projects`),
    enabled: !!workspaceSlug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetProjectBySlug(
  workspaceSlug: string,
  projectSlug?: string,
) {
  return useQuery({
    queryKey: ["project", projectSlug],
    queryFn: () => ProjectService.getProjectBySlug(workspaceSlug, projectSlug!),
    enabled: !!projectSlug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useActiveProjectsCount() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectService.getActiveProjectsCount(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectSlug,
      data,
    }: {
      projectSlug: string;
      data: CreateProject;
    }) => ProjectService.updateProject(projectSlug, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },

    onError: (err) => {
      const message = getErrorMessage(err);
      toast.error(message);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceSlug,
      projectSlug,
    }: {
      workspaceSlug: string;
      projectSlug: string;
    }) => ProjectService.deleteProject(workspaceSlug, projectSlug),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },

    onError: (err) => {
      const message = getErrorMessage(err);
      toast.error(message);
    },
  });
}
