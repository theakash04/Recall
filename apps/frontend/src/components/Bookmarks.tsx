"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import useBookmarkStore from "@/store/bookmarkStore";
import { bookmark } from "@/types/bookmarkTypes";
import clsx from "clsx";
import { CircleAlert } from "lucide-react";

const URL_REGEX = /^(https:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;

const normalizeUrl = (url: string): string => {
  try {
    const urlWithProtocol = url.toLowerCase().startsWith("https")
      ? url.toLowerCase()
      : `https://${url.toLowerCase()}`;

    const parsed = new URL(urlWithProtocol);
    return parsed.origin + parsed.pathname.replace(/\/$/, "");
  } catch {
    return url.toLowerCase();
  }
};

const BookmarkCard = ({ bookmark }: { bookmark: bookmark }) => (
  <motion.a
    href={bookmark.url}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-muted/50 rounded-xl p-4 hover:bg-muted transition-colors relative"
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.95 }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  >
    {/* Status Badge */}
    <div className="absolute top-2 right-2 z-10">
      <div className="flex items-center gap-2 justify-center">
        <span
          className={clsx("text-xs font-medium px-2 py-1 rounded-full", {
            "bg-green-500/20 text-green-600":
              bookmark.jobStatus === "completed",
            "bg-yellow-500/20 text-yellow-400": [
              "pending",
              "scraped",
              "embedded",
              "splitted",
            ].includes(bookmark.jobStatus),
            "bg-red-500/20 text-red-600": ![
              "completed",
              "pending",
              "scraped",
              "embedded",
              "splitted",
            ].includes(bookmark.jobStatus),
          })}
        >
          {bookmark.jobStatus}
        </span>
        {bookmark.isFailed && (
          // do something on click like showing the error message
          <span className="text-xs text-red-600 font-medium">
            <CircleAlert />
          </span>
        )}
      </div>
    </div>

    {/* Date */}
    <div className="absolute bottom-2 right-2">
      <p className="text-[10px] text-muted-foreground">
        {new Date(bookmark.createdAt)?.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
    </div>

    {/* Main Content */}
    <div className="flex flex-col gap-1">
      <p className="break-words font-medium pr-8">{bookmark.title}</p>
      <p className="text-xs text-muted-foreground break-words">
        {bookmark.url}
      </p>
    </div>
  </motion.a>
);

export default function Bookmarks() {
  const { isLoading, AddBookmark, bookmarks } = useBookmarkStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBookmarks, setFilteredBookmarks] =
    useState<bookmark[]>(bookmarks);
  const [isUrlNotFound, setIsUrlNotFound] = useState<string | null>(null);

  const isURL = useCallback((str: string) => URL_REGEX.test(str), []);

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (!query) {
      setFilteredBookmarks(bookmarks);
      setIsUrlNotFound(null);
      return;
    }

    if (isURL(query)) {
      const normalizedQuery = normalizeUrl(query);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_API}/search`,
        {
          params: {
            url: normalizedQuery,
            search_type: "url",
          },
          withCredentials: true,
        }
      );

      const data = response.data.data;
      if (data.length > 0) {
        setFilteredBookmarks(data);
        setIsUrlNotFound(null);
      } else {
        setFilteredBookmarks([]);
        setIsUrlNotFound(normalizedQuery);
      }
    } else {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_API}/search`,
        {
          params: {
            query: query.toLowerCase(),
            search_type: "hybrid",
          },
          withCredentials: true,
        }
      );
      const data = response.data.data;
      setFilteredBookmarks(data);
      setIsUrlNotFound(null);
    }
  }, [searchQuery, isURL]);

  useEffect(() => {
    setFilteredBookmarks(bookmarks);
  }, [bookmarks]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  async function handleAddUrl() {
    const url = searchQuery.trim();
    if (!url) return;

    if (!isURL(url)) {
      toast.warning("Please enter a valid URL.");
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    try {
      await AddBookmark({
        url: normalizedUrl,
      });
      toast.success("Bookmark added successfully!");
      setSearchQuery("");
      handleSearch();
    } catch (error) {
      console.error("Failed to add bookmark:", error);
      toast.error("Failed to add bookmark. Please try again.");
    }
  }

  return (
    <div className="w-full flex flex-col gap-6 h-max py-6">
      <div className="flex items-center gap-6 flex-col md:flex-row">
        <div className="flex-1 w-full">
          <Input
            id="bookmark-search-add"
            type="search"
            aria-label="Search bookmarks"
            placeholder="Search bookmarks..."
            className="py-6 w-full text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoFocus
          />
        </div>
        <Button
          onClick={handleSearch}
          type="button"
          className="py-6 px-10 cursor-pointer"
          aria-label="search bookmarks button"
        >
          Search
        </Button>
      </div>

      <Separator className="my-4" aria-hidden="true" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 overflow-y-hidden overflow-x-hidden md:px-6 px-0">
        <AnimatePresence mode="popLayout">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-muted-foreground col-span-full"
            >
              Loading...
            </motion.div>
          )}
          {filteredBookmarks.length > 0 && !isLoading ? (
            filteredBookmarks.flatMap((bookmark, idx) => (
              <BookmarkCard
                key={bookmark.bookmarkId ?? idx}
                bookmark={bookmark}
              />
            ))
          ) : isUrlNotFound ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted-foreground flex items-center justify-center flex-col gap-4 col-span-full"
            >
              <p>
                No bookmark found for: <strong>{isUrlNotFound}</strong>
              </p>
              <Button variant="secondary" onClick={handleAddUrl}>
                Add this URL
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted-foreground col-span-full"
            >
              No matches found. Try different keywords.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
