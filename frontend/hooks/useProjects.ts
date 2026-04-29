import { ProjectService } from "@/services/projects.service";
import { useQuery } from "@tanstack/react-query";

export function useGetWorkspaceProjects(workspaceId?: string) {
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: () => ProjectService.getWorkspaceProjects(workspaceId!),
    enabled: !!workspaceId,
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
