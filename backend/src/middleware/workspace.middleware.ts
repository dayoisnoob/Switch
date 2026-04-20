import type { NextFunction, Request, Response } from 'express';

import { and, eq } from 'drizzle-orm';
import { db } from '../config/db';
import { workspaceMembershipsTable, workspacesTable } from '../db';
import type { WorkspaceRoles } from '../types/auth.types';
import { ApiError } from '../utils/api-response';

export const requireWorkspaceMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.id) {
    throw new ApiError(401, 'Authentication required. Please sign in.');
  }

  const userId = req.user.id;
  const { workspaceId } = req.params;

  const [member] = await db
    .select({
      role: workspaceMembershipsTable.role,
      workspaceId: workspaceMembershipsTable.workspaceId,
      workspaceName: workspacesTable.name,
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

  if (!member) {
    throw new ApiError(403, 'You do not have access to this workspace.');
  }

  req.workspace = member;

  next();
};

export const requireWorkspaceRole = (roles: WorkspaceRoles[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.workspace) {
      throw new ApiError(
        403,
        'You do not have permission to perform this action'
      );
    }

    if (!roles.includes(req.workspace?.role)) {
      throw new ApiError(
        403,
        'You do not have permission to perform this action'
      );
    }

    next();
  };
};
