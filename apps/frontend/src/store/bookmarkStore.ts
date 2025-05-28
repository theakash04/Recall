import { bookmark, newBookmark } from "@/types/bookmarkTypes";
import axios from "axios";
import { create } from "zustand";

type bookmarksStore = {
  bookmarks: bookmark[];
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  AddBookmark: (newBookmark: newBookmark) => Promise<void>;
  getAllBookmarks: () => Promise<void>;
};

const useBookmarkStore = create<bookmarksStore>()((set) => ({
  bookmarks: [],
  isLoading: false,
  setIsLoading: (value) => {
    set({ isLoading: value });
  },
  AddBookmark: async (newBookmark) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_API}/add-bookmark`,
        { url: newBookmark.url },
        { withCredentials: true }
      );

      const data = response.data.data;
      set((state) => ({
        bookmarks: [...state.bookmarks, data],
        isLoading: false,
      }));
    } catch (err) {
      set({
        isLoading: false,
      });
      throw err;
    }
  },
  getAllBookmarks: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_API}/get-all-bookmarks`,
        {
          withCredentials: true,
        }
      );
      const data = response.data.data;
      set({
        bookmarks: data,
        isLoading: false,
      });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },
}));

export default useBookmarkStore;
