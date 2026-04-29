import { api } from "@/lib/api";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string;
  createdBy: string;
  boardId: string;
}
export interface ProjectCount {
  count: number;
}

export const ProjectService = {
  create: async (data: {
    name: string;
    description: string;
    workspaceSlug: string;
  }): Promise<Project> => {
    return api.post(`/workspaces/${data.workspaceSlug}/projects`, {
      name: data.name,
      description: data.description,
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
