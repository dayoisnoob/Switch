import type { Request } from 'express';

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
  isActive?: boolean;
  role?: 'user' | 'admin';
  purpose?: string;
}
export interface TokenGenType {
  id: string | null;
  firstName: string | null;
  isActive: boolean | null;
  role: 'user' | 'admin' | null;
}

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

export type WorkspaceRoles = 'member' | 'admin' | 'owner';
