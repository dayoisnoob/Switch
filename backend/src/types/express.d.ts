declare global {
  namespace Express {
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
