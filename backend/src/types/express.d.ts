import type { Request } from 'express';
import type { WorkspaceRoles } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      workspace?: {
        workspaceId: string;
        workspaceName: string;
        workspaceSlug: string;
        role: WorkspaceRoles;
      };

      resolvedProject?: { id: string; workspaceId: string; name: string };
      resolvedBoard?: { id: string; projectId: string };
      resolvedColumn?: { id: string; boardId: string; projectId: string };
      resolvedCard?: {
        id: string;
        boardId: string;
        columnId: string;
        projectId: string;
      };
      resolvedLabel?: { id: string; workspaceId: string };
      resolvedComment?: {
        id: string;
        userId: string;
        cardId: string;
        boardId: string;
        projectId: string;
      };
      resolvedAttachment?: { projectId: string; cardId: string };
    }
    interface User {
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
