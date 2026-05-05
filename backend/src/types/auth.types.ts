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
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  role?: 'user' | 'admin';
  purpose?: string;
  avatarUrl: string;
}

export interface UserType {
  id: string;
  firstName: string | null;
  lastName?: string;
  isActive: boolean;
  role: 'user' | 'admin';
  avatarUrl: string;
}

export type WorkspaceRoles = 'Member' | 'Admin' | 'Owner';
