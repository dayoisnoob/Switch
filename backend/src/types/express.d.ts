import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      workspace?: {
        workspaceId: string;
        workspaceName: string;
        role: 'owner' | 'admin' | 'member';
      };

      resolvedProject?: { id: string; workspaceId: string; name: string };
      resolvedBoard?: { id: string; projectId: string };
      resolvedColumn?: { id: string; boardId: string };
      resolvedCard?: { id: string; boardId: string; columnId: string };
      resolvedLabel?: { id: string; workspaceId: string };
      resolvedComment?: { id: string; userId: string; cardId: string };
    }
    interface User {
      // Always present
      email?: string;
      firstName?: string;
      lastName?: string | null;

      id?: string;
      role?: 'user' | 'admin';
      isActive?: boolean;

      avatarUrl?: string | null;
      authProvider?: string;
      providerId?: string;
    }
  }
}

export {};

export type WorkspaceParams = { workspaceId: string };
export type ProjectParams = { projectId: string };
export type MemberParams = { userId: string };
export type BoardParams = { boardId: string };
export type ColumnParams = { columnId: string };
export type CardParams = { cardId: string };
export type InvitationParams = { token: string };

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  role: 'user' | 'admin';
  isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
