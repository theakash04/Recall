import { user } from "@/types/userTypes"
import { create } from "zustand";

type userStore = {
  isLoading: boolean;
  userData: user | null;
  setUser: (userData: user) => void;
  clearUser: () => void;
}

export const useUserStore = create<userStore>((set) => ({
  userData: null,
  isLoading: false,
  setUser: (userData: user) => {
    set({ userData })
  },
  clearUser: () => set({ userData: null }),
}))

