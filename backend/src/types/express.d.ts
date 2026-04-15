declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      firstName: string;
      lastName: string | null;
      isActive: boolean;
      role: 'user' | 'admin';
    }
  }
}

export {};
