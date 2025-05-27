export type searchQuery = {
  query?: string;
  url?: string;
  search_type: "url" | "keyword" | "semantic" | "hybrid";
};

export type JobStatusType =
  | "pending"
  | "scraped"
  | "embedded"
  | "completed"
  | "failed";

export type bookmark = {
  bookmarkId: string;
  url: string;
  title: string;
  jobStatus: JobStatusType;
  isFailed: boolean;
  error: string;
  createdAt: Date;
};

export type newBookmark = {
  url: string;
};
