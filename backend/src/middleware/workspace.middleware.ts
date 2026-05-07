import type { NextFunction, Request, Response } from 'express';

import { and, eq } from 'drizzle-orm';
import { db } from '../config/db';
import {
  attachmentsTable,
  boardsTable,
  cardsTable,
  columnsTable,
  commentsTable,
  labelsTable,
  projectsTable,
  workspaceMembershipsTable,
  workspacesTable,
} from '../db';
import type { WorkspaceRoles } from '../types/auth.types';
import { ApiError } from '../utils/api-response';
import { asyncHandler } from '../utils/async-handler';
import type { AuthenticatedRequest } from '../types/express';

export const requireWorkspaceMember = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    if (!userId)
      throw new ApiError(401, 'Authentication required. Please sign in.');

    let workspaceId: string | undefined;

    if (req.params.workspaceSlug) {
      const [workspace] = await db
        .select({ id: workspacesTable.id })
        .from(workspacesTable)
        .where(eq(workspacesTable.slug, req.params.workspaceSlug as string))
        .limit(1);

      if (!workspace) throw new ApiError(404, 'Workspace not found.');
      workspaceId = workspace.id;

      if (req.params.projectSlug) {
        console.log(req.params.projectSlug);
        console.log(workspaceId);
        const [project] = await db
          .select({
            id: projectsTable.id,
            workspaceId: projectsTable.workspaceId,
            name: projectsTable.name,
          })
          .from(projectsTable)
          .where(
            and(
              eq(projectsTable.slug, req.params.projectSlug as string),
              eq(projectsTable.workspaceId, workspaceId)
            )
          )
          .limit(1);

        if (!project) throw new ApiError(404, 'Project not found.');
        req.resolvedProject = project;
      }
    } else if (req.params.boardId) {
      const [board] = await db
        .select({
          id: boardsTable.id,
          projectId: boardsTable.projectId,
          workspaceId: projectsTable.workspaceId,
        })
        .from(boardsTable)
        .innerJoin(projectsTable, eq(boardsTable.projectId, projectsTable.id))
        .where(eq(boardsTable.id, req.params.boardId as string))
        .limit(1);

      if (!board) throw new ApiError(404, 'Board not found.');
      workspaceId = board.workspaceId;
      req.resolvedBoard = { id: board.id, projectId: board.projectId };
    } else if (req.params.columnId) {
      const [column] = await db
        .select({
          id: columnsTable.id,
          boardId: columnsTable.boardId,
          projectId: projectsTable.id,
          workspaceId: projectsTable.workspaceId,
        })
        .from(columnsTable)
        .innerJoin(boardsTable, eq(columnsTable.boardId, boardsTable.id))
        .innerJoin(projectsTable, eq(boardsTable.projectId, projectsTable.id))
        .where(eq(columnsTable.id, req.params.columnId as string))
        .limit(1);

      if (!column) throw new ApiError(404, 'Column not found.');
      workspaceId = column.workspaceId;
      req.resolvedColumn = {
        id: column.id,
        boardId: column.boardId,
        projectId: column.projectId,
      };
    } else if (req.params.cardId) {
      const [card] = await db
        .select({
          id: cardsTable.id,
          boardId: cardsTable.boardId,
          columnId: cardsTable.columnId,
          projectId: projectsTable.id,
          workspaceId: projectsTable.workspaceId,
        })
        .from(cardsTable)
        .innerJoin(boardsTable, eq(cardsTable.boardId, boardsTable.id))
        .innerJoin(projectsTable, eq(boardsTable.projectId, projectsTable.id))
        .where(eq(cardsTable.id, req.params.cardId as string))
        .limit(1);

      if (!card) throw new ApiError(404, 'Card not found.');
      workspaceId = card.workspaceId;
      req.resolvedCard = {
        id: card.id,
        boardId: card.boardId,
        columnId: card.columnId,
        projectId: card.projectId,
      };
    } else if (req.params.labelId) {
      const [label] = await db
        .select({ id: labelsTable.id, workspaceId: labelsTable.workspaceId })
        .from(labelsTable)
        .where(eq(labelsTable.id, req.params.labelId as string))
        .limit(1);

      if (!label) throw new ApiError(404, 'Label not found.');
      workspaceId = label.workspaceId;
      req.resolvedLabel = { id: label.id, workspaceId: label.workspaceId };
    } else if (req.params.commentId) {
      const [comment] = await db
        .select({
          id: commentsTable.id,
          userId: commentsTable.userId,
          cardId: commentsTable.cardId,
          boardId: boardsTable.id,
          projectId: projectsTable.id,
          workspaceId: projectsTable.workspaceId,
        })
        .from(commentsTable)
        .innerJoin(cardsTable, eq(commentsTable.cardId, cardsTable.id))
        .innerJoin(boardsTable, eq(cardsTable.boardId, boardsTable.id))
        .innerJoin(projectsTable, eq(boardsTable.projectId, projectsTable.id))
        .where(eq(commentsTable.id, req.params.commentId as string))
        .limit(1);

      if (!comment) throw new ApiError(404, 'Comment not found');
      workspaceId = comment.workspaceId;
      req.resolvedComment = {
        id: comment.id,
        userId: comment.userId,
        cardId: comment.cardId,
        boardId: comment.boardId,
        projectId: comment.projectId,
      };
    } else if (req.params.attachmentId) {
      const [attachment] = await db
        .select({
          workspaceId: projectsTable.workspaceId,
          projectId: projectsTable.id,
          cardId: cardsTable.id,
        })
        .from(attachmentsTable)
        .innerJoin(cardsTable, eq(attachmentsTable.cardId, cardsTable.id))
        .innerJoin(boardsTable, eq(cardsTable.boardId, boardsTable.id))
        .innerJoin(projectsTable, eq(boardsTable.projectId, projectsTable.id))
        .where(eq(attachmentsTable.id, req.params.attachmentId as string))
        .limit(1);

      if (!attachment) throw new ApiError(404, 'Attachment not found');
      workspaceId = attachment.workspaceId;
      req.resolvedAttachment = {
        projectId: attachment.projectId,
        cardId: attachment.cardId,
      };
    }

    if (!workspaceId)
      throw new ApiError(400, 'Cannot determine workspace from request.');

    const [member] = await db
      .select({
        role: workspaceMembershipsTable.role,
        workspaceId: workspaceMembershipsTable.workspaceId,
        workspaceName: workspacesTable.name,
        workspaceSlug: workspacesTable.slug,
      })
      .from(workspaceMembershipsTable)
      .innerJoin(
        workspacesTable,
        eq(workspaceMembershipsTable.workspaceId, workspacesTable.id)
      )
      .where(
        and(
          eq(workspaceMembershipsTable.workspaceId, workspaceId as string),
          eq(workspaceMembershipsTable.userId, userId)
        )
      )
      .limit(1);

    if (!member)
      throw new ApiError(403, 'You do not have access to this workspace.');

    req.workspace = member;
    next();
  }
);

export const requireWorkspaceRole = (roles: WorkspaceRoles[]) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.workspace)
        throw new ApiError(
          403,
          'You do not have permission to perform this action'
        );

      if (!roles.includes(req.workspace?.role))
        throw new ApiError(
          403,
          'You do not have permission to perform this action'
        );

      next();
    }
  );
};
