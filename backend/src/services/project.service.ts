import { and, eq } from 'drizzle-orm';
import { db } from '../config/db';
import {
  boardsTable,
  columnsTable,
  projectsTable,
  workspaceMembershipsTable,
} from '../db';
import { ApiError } from '../utils/api-response';
import type { ProjectDetailType } from '../validations/project.validation';

export class ProjectService {
  static async createProject(
    userId: string,
    workspaceId: string,
    projectDetail: ProjectDetailType
  ) {
    const { name, description } = projectDetail;
    const member = await ProjectService.checkMembership(userId, workspaceId);

    if (!member) {
      throw new ApiError(403, 'You do not have access to this workspace');
    }

    const { project, board } = await db.transaction(async (tx) => {
      const [project] = await tx
        .insert(projectsTable)
        .values({
          workspaceId,
          name,
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

      await tx
        .insert(columnsTable)
        .values([
          { boardId: board.id, name: 'To Do', order: 1000 },
          { boardId: board.id, name: 'In Progress', order: 2000 },
          { boardId: board.id, name: 'Done', order: 3000 },
        ])
        .returning();

      return { project, board };
    });

    return { project, board };
  }

  static async getAllProjects(userId: string, workspaceId: string) {
    const member = await ProjectService.checkMembership(userId, workspaceId);

    if (!member) {
      throw new ApiError(403, 'You do not have access to this workspace');
    }

    const projects = await db
      .select({
        id: projectsTable.id,
        name: projectsTable.name,
        description: projectsTable.description,
        createdBy: projectsTable.createdBy,
      })
      .from(projectsTable)
      .where(eq(projectsTable.workspaceId, workspaceId));

    return projects;
  }

  static async checkMembership(userId: string, workspaceId: string) {
    const [member] = await db
      .select()
      .from(workspaceMembershipsTable)
      .where(
        and(
          eq(workspaceMembershipsTable.workspaceId, workspaceId),
          eq(workspaceMembershipsTable.userId, userId)
        )
      )
      .limit(1);

    return member;
  }
}
