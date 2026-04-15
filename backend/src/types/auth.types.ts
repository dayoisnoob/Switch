export type OAuthProfileInput = {
  email: string;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  authProvider: 'google' | 'github';
  providerId: string;
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  isActive: boolean;
  role: 'user' | 'admin';
}
