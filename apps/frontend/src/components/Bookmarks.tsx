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
import { ChevronDown, CircleAlert, RefreshCw, X } from "lucide-react";

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

const BookmarkCard = ({ bookmark }: { bookmark: bookmark }) => {
  async function handleRetry(id: string) {
    console.log(id);
  }
  return (
    <div className="relative group">
      <motion.a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-muted/50 rounded-xl p-4 hover:bg-muted transition-colors relative flex flex-col items-center justify-center gap-4"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {/* Status Badge and date */}
        <div className="flex items-center justify-between w-full">
          <div className="">
            <p className="text-[10px] text-muted-foreground">
              {new Date(bookmark.createdAt)?.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

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
          </div>
        </div>

        {/* title and url */}
        <div className="flex flex-col gap-1">
          <p className="break-words font-medium pr-8">{bookmark.title}</p>
          <p className="text-xs text-muted-foreground break-words">
            {bookmark.url}
          </p>
        </div>
        {/* rrf score and similarity */}
        <div className="flex w-full items-center justify-end">
          <p className="text-xs">
            {bookmark.rrfScore &&
              "rrf Score: " + bookmark.rrfScore.toPrecision(4)}
            {bookmark.similarity &&
              "similarity: " + bookmark.similarity.toFixed(4)}
          </p>
        </div>
      </motion.a>

      {/* Enhanced error tooltip - now outside the link */}
      {bookmark.isFailed && (
        <motion.div
          className="absolute left-full top-2/5 -translate-y-1/2 ml-4 hidden group-hover:flex w-64 z-20"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          onMouseEnter={(e) => e.stopPropagation()}
        >
          <div className="bg-muted p-3 rounded-lg shadow-lg border border-destructive/20 flex-1">
            <div className="flex items-start gap-2">
              <CircleAlert className="flex-shrink-0 text-destructive mt-0.5" />
              <p className="text-sm text-foreground break-words">
                {bookmark.error || "Processing failed. Please retry."}
              </p>
            </div>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleRetry(bookmark.bookmarkId);
              }}
              type="button"
              variant={"destructive"}
              className="mt-2 w-full py-1.5 px-3 cursor-pointer text-xs font-medium rounded-md flex items-center justify-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Retry Processing
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default function Bookmarks() {
  const { getAllBookmarks, isLoading, AddBookmark, bookmarks } =
    useBookmarkStore();
  const [isSearchLoading, setSearchIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBookmarks, setFilteredBookmarks] =
    useState<bookmark[]>(bookmarks);
  const [isUrlNotFound, setIsUrlNotFound] = useState<string | null>(null);
  const [searchType, setSearchType] = useState("keyword");

  const isURL = useCallback((str: string) => URL_REGEX.test(str), []);

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();
    setSearchIsLoading(true);

    if (!query) {
      setSearchIsLoading(false);
      setFilteredBookmarks(bookmarks);
      setIsUrlNotFound(null);
      return;
    }

    const isUrlSearch = isURL(query);
    const normalizedQuery = isUrlSearch
      ? normalizeUrl(query)
      : query.toLowerCase();
    const effectiveSearchType = isUrlSearch ? "url" : searchType;
    const searchKey = isUrlSearch
      ? { url: normalizedQuery }
      : { query: normalizedQuery };

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_API}/search`,
        {
          params: {
            ...searchKey,
            search_type: effectiveSearchType,
          },
          withCredentials: true,
        }
      );

      const results = response.data.data;

      setFilteredBookmarks(results);

      if (results.length === 0) {
        toast.info("No result found!");
        if (isUrlSearch) setIsUrlNotFound(normalizedQuery);
      } else {
        setIsUrlNotFound(null);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const statusCode = err.response.status;
        const serverError = err.response.data?.error;
        // Try to extract the first detailed message from nested _errors if present
        const firstFieldError =
          typeof serverError === "object" &&
          (Object.values(serverError)
            .flat()
            .find(
              (field: any) =>
                field &&
                typeof field === "object" &&
                Array.isArray((field as any)._errors) &&
                (field as any)._errors.length > 0
            ) as any);
        const errorMessage = firstFieldError?._errors?.[0];
        const fallbackMessage = `Request failed with status ${statusCode}.`;
        toast.error(errorMessage || fallbackMessage);
      } else {
        toast.error("Something unexpected happened!");
      }
    } finally {
      setSearchIsLoading(false);
    }
  }, [searchQuery, isURL, bookmarks, searchType]);

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
    } catch (_err) {
      toast.error("Failed to add bookmark. Please try again.");
    }
  }

  return (
    <div className="w-full flex flex-col gap-6 h-max py-6">
      <div className="flex flex-col w-full items-center space-x-2 md:flex-row md:gap-2 gap-4">
        {/* Search type selector */}
        <div className="relative md:w-max w-full">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="appearance-none h-14 pl-4 pr-10 py-2 text-sm rounded-md border border-input bg-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-full"
            aria-label="Select search type"
          >
            <option value="keyword">Keyword</option>
            <option value="semantic">Semantic</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </div>

        {/* Search input */}
        <div className="flex-1 relative w-full">
          <Input
            id="bookmark-search-add"
            type="search"
            aria-label="Search bookmarks"
            placeholder="Search bookmarks..."
            className="py-6 w-full text-base pl-4 pr-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoFocus
          />

          {/* Clear button inside input */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-accent focus:outline-none"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 opacity-70" />
            </button>
          )}
        </div>

        {/* Search button */}
        <Button
          onClick={handleSearch}
          type="button"
          className="py-6 px-10 cursor-pointer md:w-max w-full"
          aria-label="search bookmarks button"
        >
          Search
        </Button>
      </div>

      <Separator className="my-4" aria-hidden="true" />
      <div className="w-full items-center flex justify-end">
        <Button
          size={"lg"}
          variant={"outline"}
          className="flex items-center justify-center cursor-pointer"
          disabled={isLoading}
          onClick={() => getAllBookmarks()}
        >
          <RefreshCw />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 overflow-y-hidden overflow-x-hidden md:px-6 px-0">
        <AnimatePresence mode="popLayout">
          {isSearchLoading || isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-center text-muted-foreground col-span-full py-8 flex flex-col items-center justify-center"
              role="status"
              aria-live="polite"
            >
              <svg
                className="animate-spin h-5 w-5 text-muted-foreground mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <span className="text-sm">
                {isSearchLoading
                  ? "Searching bookmarks..."
                  : "Loading bookmarks..."}
              </span>
            </motion.div>
          ) : filteredBookmarks.length > 0 ? (
            filteredBookmarks.map((bookmark, idx) => (
              <BookmarkCard
                key={bookmark.bookmarkId ?? idx}
                bookmark={bookmark}
              />
            ))
          ) : isUrlNotFound ? (
            <motion.div
              key="no-url"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
