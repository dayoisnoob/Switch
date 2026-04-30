import { api } from "@/lib/api";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  status: string;
  icon: string;
  description: string;
  createdBy: string;
}
export interface ProjectCount {
  count: number;
}
export interface CreateProject {
  icon: string;
  name: string;
  description: string;
  workspaceSlug: string;
  workspaceId: string;
}

export const ProjectService = {
  create: async (data: CreateProject): Promise<Project> => {
    return api.post(`/workspaces/${data.workspaceSlug}/projects`, {
      name: data.name,
      description: data.description,
      icon: data.icon,
      workspaceId: data.workspaceId,
    });
  },

  getWorkspaceProjects: async (workspaceId: string): Promise<Project[]> => {
    return api.get(`/workspaces/${workspaceId}/projects`);
  },

  getProjectBySlug: async (projectSlug: string): Promise<Project> => {
    return api.get(`/projects/${projectSlug}`);
  },

  getActiveProjectsCount: async (): Promise<ProjectCount> => {
    return api.get(`/projects/count`);
  },
};
