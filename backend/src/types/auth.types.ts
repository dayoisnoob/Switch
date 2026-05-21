export type OAuthProfileInput = {
  email: string;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  authProvider: 'google' | 'github';
  providerId: string;
};

export interface JwtPayload {
  id: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  isActive?: boolean;
  role?: 'user' | 'admin';
  purpose?: string;
  avatarUrl?: string | null;
}

export interface UserType {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email?: string;
  isActive: boolean;
  role: 'user' | 'admin';
  avatarUrl: string | null;
}

export type WorkspaceRoles = 'Member' | 'Admin' | 'Owner';
