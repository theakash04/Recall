import { searchType } from "@/types/bookmarkTypes";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type settings = {
  default_search_type: searchType;
};

type globalStoreType = {
  isGlobalLoading: boolean;
  isServerError: boolean;
  globalSetting: settings;
  setGlobalLoading: (state: boolean) => void;
  editGlobalSetting: (state: settings) => boolean;
  setServerError: (state: boolean) => void;
};

export const useGlobalStore = create<globalStoreType>()(
  persist(
    (set, get) => ({
      isGlobalLoading: false,
      isServerError: false,
      globalSetting: {
        default_search_type: "semantic",
      },
      editGlobalSetting(state) {
        try {
          set({
            globalSetting: state,
          });
          return true;
        } catch {
          return false;
        }
      },
      setGlobalLoading(state) {
        set({
          isGlobalLoading: state,
        });
      },
      setServerError(state) {
        set({
          isServerError: state,
        });
      },
    }),
    {
      name: "global-settings",
      partialize: (state) => ({
        globalSetting: state.globalSetting,
      }),
    }
  )
);
