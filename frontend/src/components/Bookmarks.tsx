"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { bookmark, searchParams, searchType } from "@/types/bookmarkTypes";
import clsx from "clsx";
import { ChevronDown, CircleAlert, RefreshCw, X } from "lucide-react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addBookmark,
  BookmarkJobRetry,
  fetchBookmarks,
  searchBookmark,
} from "@/lib/bookmarksApi";
import { ApiResponse } from "@/types/apiResponse";
import { ErrorCodes } from "@/types/constant";
import { useGlobalStore } from "@/store/globalStore";

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
  const queryClient = useQueryClient();
  async function handleRetry(id: string) {
    const response = await BookmarkJobRetry(id);
    if (response.success) {
      queryClient.refetchQueries({ queryKey: ["bookmarks"] });
      toast.info(response.message);
      return;
    }

    toast.error(response.error.code, {
      description: response.error.message,
    });
  }
  return (
    <div className="relative group h-full">
      <motion.a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-muted/50 rounded-xl p-4 hover:bg-muted transition-colors relative h-full min-h-[200px] flex flex-col items-start justify-between gap-4"
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
  const queryClient = useQueryClient();
  const { setServerError, globalSetting } = useGlobalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState<searchParams | null>(null);
  const [isUrlNotFound, setIsUrlNotFound] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<searchType>(
    globalSetting.default_search_type
  );
  const searchBarRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const isURL = useCallback((str: string) => URL_REGEX.test(str), []);

  const {
    data: bookmarksResponse,
    isLoading: isBookmarkLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["bookmarks"],
    queryFn: fetchBookmarks,
    getNextPageParam: (lastPage) => {
      return lastPage.data?.pagination?.nextPage || undefined;
    },
    initialPageParam: 1,
  });

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    isError: isSearchError,
  } = useQuery<ApiResponse<bookmark[]>>({
    queryKey: ["search_results", searchTerm],
    queryFn: () => searchBookmark(searchTerm!),
    enabled: !!searchTerm,
    retry: false,
  });

  const { mutateAsync } = useMutation({
    mutationFn: addBookmark,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  const allBookmarks =
    bookmarksResponse?.pages?.flatMap((page) =>
      page.success ? page.data.data : []
    ) || [];

  // Interaction observer Inf scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (
          target.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !searchTerm
        ) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, searchTerm]);

  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim();

    if (!query) {
      setIsUrlNotFound(null);
      setSearchTerm(null);
      toast.warning("Please type something to search for");
      return;
    }

    const isUrlSearch = isURL(query);
    const normalizedQuery = isUrlSearch
      ? normalizeUrl(query)
      : query.toLowerCase();
    if (isUrlSearch) {
      setIsUrlNotFound(normalizedQuery);
    }
    const effectiveSearchType = isUrlSearch ? "url" : searchType;
    const searchKey = {
      query: normalizedQuery,
      search_type: effectiveSearchType,
    };
    queryClient.invalidateQueries({ queryKey: ["search_results"] });
    setSearchTerm(searchKey);
  }, [searchQuery, isURL, searchType, queryClient]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    const isMac = navigator.userAgent.toLowerCase().includes("mac");

    const isCtrlK = !isMac && e.ctrlKey && e.key.toLowerCase() === "k";
    const isCmdK = isMac && e.metaKey && e.key.toLowerCase() === "k";

    if (isCtrlK || isCmdK) {
      e.preventDefault();

      if (searchBarRef.current) {
        searchBarRef.current.focus();
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleSearchKeyDown);
    return () => {
      window.removeEventListener("keydown", handleSearchKeyDown);
    };
  }, []);

  async function handleAddBookmark() {
    const url = searchQuery.trim();

    if (!url && !isURL(url)) {
      toast.warning("Please enter a valid URL.");
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    const toastId = toast.loading("Adding Bookmark");
    try {
      const result = await mutateAsync({ url: normalizedUrl });
      if (!result.success) {
        if (
          result?.error.code === ErrorCodes.VALIDATION_ERROR ||
          result?.error.code === ErrorCodes.URL_NOT_SCRAPABLE
        ) {
          throw new Error(result.error.message);
        }
      }
      toast.success("Bookmark added successfully!", { id: toastId });
      setSearchQuery("");
      handleSearch();
    } catch (err: any) {
      const error = err.response.data.error;
      let queryError;
      if (error.details) {
        queryError = JSON.parse(error.details).query._errors[0];
      }
      toast.error("Failed to add bookmark.", {
        description: queryError || error.message,
        id: toastId,
      });

      if (error.response.data.code === ErrorCodes.SERVER_ERROR) {
        setServerError(true);
      }
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === "" && searchTerm) {
      setSearchTerm(null);
    }
  }, [searchQuery, searchTerm]);

  async function refreshBookmarks() {
    await refetch();
    setSearchQuery("");
    setSearchTerm(null);
    setIsUrlNotFound(null);
  }

  const resultsToDisplay =
    searchTerm && searchResults?.success ? searchResults.data : allBookmarks;

  return (
    <div className="w-full flex flex-col gap-6 h-max py-6">
      <div className="flex flex-col w-full items-center space-x-2 md:flex-row md:gap-2 gap-4">
        {/* Search type selector */}
        <div className="relative md:w-max w-full">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as searchType)}
            className={clsx(
              "appearance-none h-14 pl-4 pr-10 py-2 text-sm rounded-md border border-input bg-background  focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-full",
              isSearchLoading ? "cursor-not-allowed" : "cursor-pointer"
            )}
            aria-label="Select search type"
            aria-disabled={isSearchLoading}
            disabled={isSearchLoading}
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
            className={clsx(
              "py-6 w-full text-base pl-4 pr-12",
              isSearchLoading ? "cursor-not-allowed" : "cursor-pointer"
            )}
            value={searchQuery}
            ref={searchBarRef}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-invalid={isSearchError}
            autoComplete="off"
            autoFocus
            disabled={isSearchLoading}
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none border-1 rounded-md p-2 bg-foreground/10">
            {navigator.userAgent.toLowerCase().includes("mac")
              ? "⌘K"
              : "Ctrl+K"}
          </span>
        </div>

        {/* Search button */}
        <Button
          onClick={handleSearch}
          type="button"
          className={clsx(
            "py-6 px-10 md:w-max w-full",
            searchTerm ? "cursor-not-allowed" : "cursor-pointer"
          )}
          aria-label="search bookmarks button"
          aria-busy={isSearchLoading}
          aria-disabled={isSearchLoading}
          disabled={isSearchLoading || !searchQuery.trim()}
        >
          {isSearchLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      <Separator className="my-4" aria-hidden="true" />
      <div className="w-full items-center flex justify-end">
        <Button
          size={"lg"}
          variant={"outline"}
          className="flex items-center justify-center cursor-pointer"
          disabled={isBookmarkLoading || isSearchLoading}
          onClick={refreshBookmarks}
        >
          <RefreshCw />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 overflow-y-hidden overflow-x-hidden px-6 py-4 grid-rows-[repeat(auto-fit-1fr)]">
        <AnimatePresence mode="popLayout">
          {isSearchLoading || isBookmarkLoading ? (
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
          ) : resultsToDisplay.length > 0 ? (
            resultsToDisplay.map((bookmark, idx) => (
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
              <Button
                variant="secondary"
                onClick={handleAddBookmark}
                className="cursor-pointer"
              >
                Add this Bookmark
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
              {searchTerm
                ? `No bookmarks match your search for "${searchTerm.query}". Try adjusting your search terms or search type.`
                : "Start building your bookmark collection by adding URLs you want to save and search through later."}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* intersection observer Target and loading indic */}
      {!searchTerm && (
        <>
          <div ref={observerRef} className="h-10 w-full" />
          {isFetchingNextPage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <svg
                className="animate-spin h-5 w-5 text-muted-foreground mx-auto mb-2"
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
              <span className="text-sm text-muted-foreground">
                Loading more bookmarks...
              </span>
            </motion.div>
          )}
        </>
      )}
      {!hasNextPage && allBookmarks.length > 0 && !searchTerm && (
        <motion.div
          key="end-of-data"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center gap-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-[1px] bg-muted-foreground/30"></div>
            <span className="text-sm">You've reached the end</span>
            <div className="w-8 h-[1px] bg-muted-foreground/30"></div>
          </div>
          <p className="text-xs text-muted-foreground/70">
            {allBookmarks.length} bookmark{allBookmarks.length !== 1 ? "s" : ""}{" "}
            total
          </p>
        </motion.div>
      )}
    </div>
  );
}
