import { UserProfile } from "@/hooks/useAuth";
import { create } from "zustand";

interface AuthStore {
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,

  setUser: (user: UserProfile) => set({ user }),
  clearUser: () => set({ user: null }),
}));
