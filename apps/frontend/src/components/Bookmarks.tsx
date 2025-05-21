"use client";

import { useCallback, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { AnimatePresence, motion } from "framer-motion";

type Bookmark = {
  id: number;
  title: string;
  url: string;
  createdAt?: Date;
  status: "pending" | "completed" | "failed";
};

const dummyBookmarks: Bookmark[] = [
  {
    id: 1,
    title: "Google",
    url: "https://www.google.com",
    createdAt: new Date(),
    status: "failed",
  },
  {
    id: 2,
    title: "Facebook",
    url: "https://www.facebook.com",
    createdAt: new Date(),
    status: "pending",
  },
  {
    id: 3,
    title: "Twitter",
    url: "https://www.twitter.com",
    createdAt: new Date(),
    status: "pending",
  },
  {
    id: 4,
    title: "LinkedIn",
    url: "https://www.linkedin.com",
    createdAt: new Date(),
    status: "failed",
  },
  {
    id: 5,
    title: "GitHub",
    url: "https://www.github.com",
    createdAt: new Date(),
    status: "pending",
  },
  {
    id: 6,
    title: "Stack Overflow",
    url: "https://stackoverflow.com",
    createdAt: new Date(),
    status: "pending",
  },
  {
    id: 7,
    title: "Reddit",
    url: "https://www.reddit.com",
    createdAt: new Date(),
    status: "pending",
  },
  {
    id: 8,
    title: "YouTube",
    url: "https://www.youtube.com",
    createdAt: new Date(),
    status: "completed",
  },
  {
    id: 9,
    title: "Instagram",
    url: "https://www.instagram.com",
    createdAt: new Date(),
    status: "completed",
  },
  {
    id: 10,
    title: "Pinterest",
    url: "https://www.pinterest.com",
    createdAt: new Date(),
    status: "completed",
  },
  {
    id: 11,
    title: "Tumblr",
    url: "https://www.tumblr.com",
    createdAt: new Date(),
    status: "pending",
  },
  {
    id: 12,
    title: "Flickr",
    url: "https://www.flickr.com",
    createdAt: new Date(),
    status: "completed",
  },
  {
    id: 13,
    title: "Quora",
    url: "https://www.quora.com",
    createdAt: new Date(),
    status: "pending",
  },
  {
    id: 14,
    title: "WhatsApp",
    url: "https://www.whatsapp.com",
    createdAt: new Date(),
    status: "completed",
  },
  {
    id: 15,
    title: "Snapchat",
    url: "https://www.snapchat.com",
    createdAt: new Date(),
    status: "failed",
  },
];

const URL_REGEX = /^(https:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;

const normalizeUrl = (url: string): string => {
  try {
    const urlWithProtocol = url.toLowerCase().startsWith("https")
      ? url.toLowerCase()
      : `https://${url.toLowerCase()}`;

    const parsed = new URL(urlWithProtocol);
    return (
      parsed.hostname.replace(/^www\./, "") + parsed.pathname.replace(/\/$/, "")
    );
  } catch {
    return url.toLowerCase();
  }
};

const BookmarkCard = ({ bookmark }: { bookmark: Bookmark }) => (
  <motion.a
    href={bookmark.url}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-muted/50 rounded-xl p-4 hover:bg-muted transition-colors relative" // Added relative
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.95 }}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  >
    {/* Status Badge */}
    <div className="absolute top-2 right-2 z-10">
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full ${
          bookmark.status === "completed"
            ? "bg-green-500/20 text-green-600"
            : bookmark.status === "pending"
              ? "bg-yellow-500/20 text-yellow-600"
              : "bg-red-500/20 text-red-600"
        }`}
      >
        {bookmark.status}
      </span>
    </div>

    {/* Date */}
    <div className="absolute bottom-2 right-2">
      <p className="text-[10px] text-muted-foreground">
        {bookmark.createdAt?.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
    </div>

    {/* Main Content */}
    <div className="flex flex-col gap-1">
      <p className="break-words font-medium pr-8">{bookmark.title}</p>
      <p className="text-xs text-muted-foreground truncate">
        {new URL(bookmark.url).hostname}
      </p>
    </div>
  </motion.a>
);

export default function Bookmarks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBookmarks, setFilteredBookmarks] =
    useState<Bookmark[]>(dummyBookmarks);
  const [isUrlNotFound, setIsUrlNotFound] = useState<string | null>(null);

  const isURL = useCallback((str: string) => URL_REGEX.test(str), []);

  const handleSearch = useCallback(() => {
    const query = searchQuery.trim();
    if (!query) {
      console.log("No query");
      setFilteredBookmarks(dummyBookmarks);
      setIsUrlNotFound(null);
      return;
    }
    console.log(isURL(query));

    if (isURL(query)) {
      const normalizedQuery = normalizeUrl(query);
      console.log("Normalized URL:", normalizedQuery);
      const matches = dummyBookmarks.filter(
        (bookmark) => normalizeUrl(bookmark.url) === normalizedQuery
      );

      if (matches.length > 0) {
        setFilteredBookmarks(matches);
        setIsUrlNotFound(null);
      } else {
        setFilteredBookmarks([]);
        setIsUrlNotFound(normalizedQuery);
      }
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = dummyBookmarks.filter(
        (bookmark) =>
          bookmark.title.toLowerCase().includes(lowerQuery) ||
          bookmark.url.toLowerCase().includes(lowerQuery)
      );
      setFilteredBookmarks(filtered);
      setIsUrlNotFound(null);
    }
  }, [searchQuery, isURL]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="w-full flex flex-col gap-6 h-max py-6">
      <div className="flex items-center gap-6 flex-col md:flex-row">
        <div className="flex-1 w-full">
          <Input
            type="search"
            placeholder="Search bookmarks..."
            className="py-6 w-full text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoFocus
          />
        </div>
        <Button onClick={handleSearch} className="py-6 px-10 cursor-pointer">
          Search
        </Button>
      </div>

      <Separator className="my-4" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 overflow-y-hidden overflow-x-hidden md:px-6 px-0">
        <AnimatePresence mode="popLayout">
          {filteredBookmarks.length > 0 ? (
            filteredBookmarks.map((bookmark) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
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
              <Button
                variant="secondary"
                onClick={() => alert(`Add URL: ${isUrlNotFound}`)}
              >
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
