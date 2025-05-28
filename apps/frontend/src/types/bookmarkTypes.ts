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
  rrfScore?: number;
  similarity?: number;
};

export type newBookmark = {
  url: string;
};
