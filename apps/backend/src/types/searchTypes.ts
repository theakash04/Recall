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
