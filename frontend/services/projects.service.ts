import { api } from "@/lib/api";

export interface ProjectType {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string;
  createdBy: string;
  boardId: string;
}

export const ProjectService = {
  createProject: async (data: {
    name: string;
    description: string;
    workspaceSlug: string;
  }): Promise<ProjectType> => {
    return api.post(`/workspaces/${data.workspaceSlug}/projects`, {
      name: data.name,
      description: data.description,
    });
  },

  getProjects: async (workspaceId: string): Promise<ProjectType[]> => {
    return api.get(`/workspaces/${workspaceId}/projects`);
  },

  getProjectBySlug: async (projectSlug: string): Promise<ProjectType> => {
    return api.get(`/projects/${projectSlug}`);
  },
};
