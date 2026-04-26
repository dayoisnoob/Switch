import { ProjectService } from "@/services/projects.service";
import { WorkspaceService } from "@/services/workspace.service";
import { useQuery } from "@tanstack/react-query";

export function useWorkspaceProjects(workspaceId?: string) {
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: () => ProjectService.getProjects(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceMembers(workspaceId?: string) {
  return useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => WorkspaceService.getMembers(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useProjectBySlug(projectSlug?: string) {
  return useQuery({
    queryKey: ["project", projectSlug],
    queryFn: () => ProjectService.getProjectBySlug(projectSlug!),
    enabled: !!projectSlug,
  });
}
