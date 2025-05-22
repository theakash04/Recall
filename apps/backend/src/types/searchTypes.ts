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

export type searchResult = {
  bookmarkId: string;
  url: string;
  title: string;
  jobStatus: "pending" | "scraped" | "embedded" | "completed" | "failed";
  rank?: number;
  similarity?: number;
  rrfScore?: number;
};

export type KeywordSearchParams = {
  query: string;
  userId: string;
  match_count: number;
};

export type semanticSearchparams = Omit<KeywordSearchParams, "query"> & {
  queryEmbedding: number[];
  match_threshold: number;
};

export type hybridParams = KeywordSearchParams &
  semanticSearchparams & {
    rrf_constant?: number;
  };

export type urlSearchParams = {
  query: string;
  userId: string;
};

