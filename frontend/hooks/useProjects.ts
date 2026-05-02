import { getErrorMessage } from "@/lib/utils";
import { CreateProject, ProjectService } from "@/services/projects.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
    queryFn: () => ProjectService.getWorkspaceProjects(workspaceSlug!),
    enabled: !!workspaceSlug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGetProjectBySlug(projectSlug?: string) {
  return useQuery({
    queryKey: ["project", projectSlug],
    queryFn: () => ProjectService.getProjectBySlug(projectSlug!),
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
    mutationFn: async (data: CreateProject) =>
      ProjectService.updateProject(data),

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
