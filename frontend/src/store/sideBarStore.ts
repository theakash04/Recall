import { create } from "zustand";

type SidebarStore = {
  isExpanded: boolean;
  toggleSidebar: () => void;
  activeSubmenu: string | null;
  setActiveSubmenu: (submenu: string | null) => void;
  setExpanded: (value: boolean) => void;
};

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  isExpanded: true,
  activeSubmenu: null,

  toggleSidebar: () => {
    const { isExpanded } = get();
    set({
      isExpanded: !isExpanded,
      activeSubmenu: isExpanded ? null : get().activeSubmenu,
    });
  },
  setExpanded: (value: boolean) => {
    set({
      isExpanded: value,
    });
  },

  setActiveSubmenu: (submenu: string | null) => set({ activeSubmenu: submenu }),
}));
