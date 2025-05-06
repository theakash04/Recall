"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { motion } from "framer-motion";

type Bookmark = {
  id: number;
  title: string;
  url: string;
  createdAt?: Date;
};

const dummyBookmarks = [
  {
    id: 1,
    title: "Google",
    url: "https://www.google.com",
    createdAt: new Date(),
  },
  {
    id: 2,
    title: "Facebook",
    url: "https://www.facebook.com",
    createdAt: new Date(),
  },
  {
    id: 3,
    title: "Twitter",
    url: "https://www.twitter.com",
    createdAt: new Date(),
  },
  {
    id: 4,
    title: "LinkedIn",
    url: "https://www.linkedin.com",
    createdAt: new Date(),
  },
  {
    id: 5,
    title: "GitHub",
    url: "https://www.github.com",
    createdAt: new Date(),
  },
  {
    id: 6,
    title: "Stack Overflow",
    url: "https://stackoverflow.com",
    createdAt: new Date(),
  },
  {
    id: 7,
    title: "Reddit",
    url: "https://www.reddit.com",
    createdAt: new Date(),
  },
  {
    id: 8,
    title: "YouTube",
    url: "https://www.youtube.com",
    createdAt: new Date(),
  },
  {
    id: 9,
    title: "Instagram",
    url: "https://www.instagram.com",
    createdAt: new Date(),
  },
  {
    id: 10,
    title: "Pinterest",
    url: "https://www.pinterest.com",
    createdAt: new Date(),
  },
];

export default function SearchBookmarks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([
    ...dummyBookmarks,
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleSearch = () => {
    const filtered = dummyBookmarks.filter((bookmark) =>
      bookmark.title.toLowerCase().includes(searchQuery)
    );
    setFilteredBookmarks(filtered);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 max-h-[70vh]">
      <div className="flex items-center gap-4 flex-col md:flex-row">
        <div className="flex-1 w-full">
          <Input
            type="text"
            placeholder="Search bookmarks..."
            className="py-6 w-full"
            value={searchQuery}
            onChange={handleChange}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            onKeyDown={handleKeyDown}
            autoCapitalize="none"
            autoFocus
            required
            minLength={5}
          />
        </div>
        <Button onClick={handleSearch} className="py-6 px-10">
          Search
        </Button>
      </div>

      <Separator className="my-4" />
      <div className="grid auto-rows-min gap-4 md:grid-cols-1 overflow-y-auto overflow-x-hidden px-6 scroll-smooth scrollbar">
        {filteredBookmarks.length > 0 ? (
          filteredBookmarks.map((bookmark) => (
            <motion.a
              key={bookmark.id}
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-muted/50 rounded-xl p-4"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex gap-4 items-center justify-between flex-wrap">
                <p className="w-full break-words">{bookmark.title}</p>
                <p className="text-[10px] text-muted-foreground w-full text-end">
                  {bookmark.createdAt
                    ? bookmark.createdAt.toLocaleDateString()
                    : "No date available"}
                </p>
              </div>
            </motion.a>
          ))
        ) : (
          <div className="text-center text-muted-foreground">
            No bookmarks found.
          </div>
        )}
      </div>
    </div>
  );
}
