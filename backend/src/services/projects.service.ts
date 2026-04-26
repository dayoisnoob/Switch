import { and, eq } from 'drizzle-orm';
import { db } from '../config/db';
import { boardsTable, columnsTable, projectsTable } from '../db';
import { ApiError } from '../utils/api-response';
import { slugGen } from '../utils/helpers';

export class ProjectService {
  static async createProject(
    userId: string,
    workspaceId: string,
    name: string,
    description: string
  ) {
    const slug = slugGen(name);

    try {
      const { project, board } = await db.transaction(async (tx) => {
        const [project] = await tx
          .insert(projectsTable)
          .values({
            workspaceId,
            name,
            slug,
            description,
            createdBy: userId,
          })
          .returning();

        if (!project) {
          throw new ApiError(500, 'Error creating project, please try again');
        }

        const [board] = await tx
          .insert(boardsTable)
          .values({
            projectId: project.id,
          })
          .returning();

        if (!board) {
          throw new ApiError(500, 'Error creating board, please try again');
        }

        await tx.insert(columnsTable).values([
          { boardId: board.id, name: 'To Do', order: 1.0 },
          { boardId: board.id, name: 'In Progress', order: 2.0 },
          { boardId: board.id, name: 'Done', order: 3.0 },
        ]);

        return { project, board };
      });

      return {
        id: project.id,
        workspaceId: project.workspaceId,
        name: project.name,
        slug: project.slug,
        description: project.description,
        createdBy: project.createdBy,
        boardId: board.id,
      };
    } catch (err) {
      const code = (err as any).cause.code;
      if (code === '23505')
        throw new ApiError(
          409,
          'Project with the same name already exists in the workspace'
        );

      throw err;
    }
  }

  static async getAllProjects(workspaceId: string) {
    const projects = await db
      .select({
        id: projectsTable.id,
        workspaceId: projectsTable.workspaceId,
        name: projectsTable.name,
        slug: projectsTable.slug,
        description: projectsTable.description,
        createdBy: projectsTable.createdBy,
      })
      .from(projectsTable)
      .where(eq(projectsTable.workspaceId, workspaceId));

    return projects;
  }

  static async getProject(workspaceId: string, slug: string) {
    const project = await ProjectService.verifyProject(workspaceId, slug);

    return project;
  }

  static async updateProject(
    workspaceId: string,
    slug: string,
    name: string,
    description: string
  ) {
    const project = await ProjectService.verifyProject(workspaceId, slug);

    const [updatedProject] = await db
      .update(projectsTable)
      .set({
        ...(name && { name }),
        ...(description && { description }),
      })
      .where(eq(projectsTable.id, project.id))
      .returning();

    if (!updatedProject)
      throw new ApiError(500, 'Error updating project, Please try again');

    return updatedProject;
  }

  static async deleteProject(workspaceId: string, slug: string) {
    const project = await ProjectService.verifyProject(workspaceId, slug);

    const [deletedProject] = await db
      .delete(projectsTable)
      .where(eq(projectsTable.id, project.id))
      .returning();

    if (!deletedProject)
      throw new ApiError(500, 'Error deleting project, Please try again');

    return deletedProject;
  }

  private static async verifyProject(workspaceId: string, slug: string) {
    const [project] = await db
      .select({
        id: projectsTable.id,
        workspaceId: projectsTable.workspaceId,
        name: projectsTable.name,
        slug: projectsTable.slug,
        description: projectsTable.description,
        createdBy: projectsTable.createdBy,
        boardId: boardsTable.id,
      })
      .from(projectsTable)
      .innerJoin(boardsTable, eq(projectsTable.id, boardsTable.projectId))
      .where(
        and(
          eq(projectsTable.slug, slug),
          eq(projectsTable.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    return project;
  }
}
