import { create } from "zustand";

interface AuthStoreType {
  email: string | null;
  token: string | null;

  setUserMail: (email: string) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthStoreType>()((set) => ({
  email: null,
  token: null,

  setUserMail: (email) => set({ email }),
  setToken: (token) => set({ token }),
}));
