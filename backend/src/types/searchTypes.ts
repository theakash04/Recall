export type KeywordHit = {
  bookmarkId: string;
  url: string;
  title: string;
  jobStatus: string;
  rank: number;
};

export type SemanticHit = {
  bookmarkId: string;
  url: string;
  title: string;
  jobStatus: string;
  similarity: number;
};

export type JobStatusType =
  | "pending"
  | "scraped"
  | "embedded"
  | "completed"
  | "failed";

export type searchResult = {
  bookmarkId: string;
  url: string;
  title: string;
  jobStatus: JobStatusType;
  isFailed: boolean;
  error: string;
  createdAt: Date;
  rank?: number;
  similarity?: number;
  rrfScore?: number;
};

export type KeywordSearchParams = {
  query: string;
  userId: string;
};

export type semanticSearchparams = Omit<KeywordSearchParams, "query"> & {
  queryEmbedding: number[];
};

export type hybridParams = KeywordSearchParams &
  semanticSearchparams & {
    rrf_constant?: number;
  };

export type urlSearchParams = {
  query: string;
  userId: string;
};
export type urlSearchReturn = {
  bookmarkId: string;
  url: string;
  title: string;
  jobStatus: string;
  isFailed: boolean;
  error: string;
  createdAt: Date;
};
