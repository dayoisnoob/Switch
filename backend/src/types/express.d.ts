declare global {
  namespace Express {
    interface Request {
      workspace?: {
        workspaceId: string;
        workspaceName: string;
        role: 'owner' | 'admin' | 'member';
      };
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
