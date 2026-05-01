import { and, count, countDistinct, desc, eq, sql } from 'drizzle-orm';
import { db } from '../config/db';
import {
  boardsTable,
  cardAssigneesTable,
  cardsTable,
  columnsTable,
  projectsTable,
  usersTable,
  workspaceMembershipsTable,
  workspacesTable,
} from '../db';
import { ApiError } from '../utils/api-response';
import { slugGen } from '../utils/helpers';
import type { ProjectInput } from '../validations/projects.validation';

export class ProjectService {
  static async createProject(userId: string, data: ProjectInput) {
    const { name, description, icon, workspaceId } = data;
    const slug = slugGen(name);

    try {
      const { project, board } = await db.transaction(async (tx) => {
        const [project] = await tx
          .insert(projectsTable)
          .values({
            workspaceId,
            name,
            slug,
            icon,
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
          {
            boardId: board.id,
            name: 'To Do',
            order: 1.0,
            mappedStatus: 'TODO',
          },
          {
            boardId: board.id,
            name: 'In Progress',
            order: 2.0,
            mappedStatus: 'IN_PROGRESS',
          },
          { boardId: board.id, name: 'Done', order: 3.0, mappedStatus: 'DONE' },
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

  static async getWorkspaceProjects(workspaceId: string) {
    const cardsCount = db
      .select({
        projectId: boardsTable.projectId,
        totalCards: count(cardsTable.id).as('total-cards'),
        doneCards:
          sql<number>`count(${cardsTable.id}) filter (where ${cardsTable.status} = 'DONE')`
            .mapWith(Number)
            .as('done_cards'),
      })
      .from(cardsTable)
      .innerJoin(boardsTable, eq(cardsTable.boardId, boardsTable.id))
      .groupBy(boardsTable.projectId)
      .as('cards-count');

    const projectAssignees = db
      .select({
        projectId: boardsTable.projectId,
        members: sql<{ name: string; avatarUrl: string | null }[]>`
        json_agg(
          distinct jsonb_build_object(
            'firstName', ${usersTable.firstName},
            'avatarUrl', ${usersTable.avatarUrl}
          )
        )
      `.as('assignees_array'),
      })
      .from(cardAssigneesTable)
      .innerJoin(usersTable, eq(cardAssigneesTable.userId, usersTable.id))
      .innerJoin(cardsTable, eq(cardAssigneesTable.cardId, cardsTable.id))
      .innerJoin(boardsTable, eq(cardsTable.boardId, boardsTable.id))
      .groupBy(boardsTable.projectId)
      .as('project_assignees_sq');

    const projects = await db
      .select({
        id: projectsTable.id,
        workspaceId: projectsTable.workspaceId,
        name: projectsTable.name,
        slug: projectsTable.slug,
        status: projectsTable.status,
        icon: projectsTable.icon,
        description: projectsTable.description,
        createdBy: projectsTable.createdBy,
        cardsCount: cardsCount.totalCards,
        finishedCards: cardsCount.doneCards,
        assignees: projectAssignees.members,
      })
      .from(projectsTable)
      .leftJoin(cardsCount, eq(projectsTable.id, cardsCount.projectId))
      .leftJoin(
        projectAssignees,
        eq(projectsTable.id, projectAssignees.projectId)
      )
      .orderBy(desc(projectsTable.createdAt))
      .where(eq(projectsTable.workspaceId, workspaceId));

    return projects;
  }

  static async getUserActiveProjectsCount(userId: string) {
    const [result] = await db
      .select({
        total: count(projectsTable.id),
      })

      .from(projectsTable)
      .innerJoin(
        workspaceMembershipsTable,
        eq(projectsTable.workspaceId, workspaceMembershipsTable.workspaceId)
      )
      .where(
        and(
          eq(workspaceMembershipsTable.userId, userId),
          eq(projectsTable.status, 'Active')
        )
      );

    return result?.total;
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
