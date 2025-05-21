import { db } from "@repo/database/database";
import {
  bookmarkContent,
  globalBookmarks,
  globalJobsBookmarks,
  splitContent,
  usersBookmarks,
  vectorEmbedding,
} from "@repo/database/schema";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";

type KeywordSearchParams = {
  query: string;
  userId: string;
  match_count: number;
};

type semanticSearchparams = Omit<KeywordSearchParams, "query"> & {
  queryEmbedding: number[];
  match_threshold: number;
};

type hybridParmas = KeywordSearchParams &
  semanticSearchparams & {
    rrf_contant?: number;
  };

type rrfFusedArr = {
  bookmarkId: string;
  url: string;
  title: string;
  jobStatus: string;
  rrfScore: number;
};

export async function keyword_search(params: KeywordSearchParams) {
  const match_count = params.match_count || 8;

  const query = sql`plainto_tsquery('english', ${params.query})`;
  const result = await db
    .select({
      bookmarkId: usersBookmarks.id,
      url: usersBookmarks.url,
      title: globalBookmarks.title,
      jobStatus: globalJobsBookmarks.status,
      rank: sql`ts_rank(${splitContent.contentSearch}, ${query})`.as("rank"),
    })
    .from(usersBookmarks)
    .innerJoin(
      globalBookmarks,
      eq(usersBookmarks.globalBookmarkId, globalBookmarks.id)
    )
    .innerJoin(
      bookmarkContent,
      eq(globalBookmarks.bookmarkContentId, bookmarkContent.id)
    )
    .innerJoin(
      splitContent,
      eq(bookmarkContent.id, splitContent.bookmarkContentId)
    )
    .innerJoin(
      globalJobsBookmarks,
      eq(globalJobsBookmarks.globalBookmarkId, globalBookmarks.id)
    )
    .where(
      and(
        eq(usersBookmarks.userId, params.userId),
        sql`${splitContent.contentSearch} @@ ${query}`
      )
    )
    .orderBy(desc(sql`ts_rank(${splitContent.contentSearch}, ${query})`))
    .limit(match_count);

  return result;
}

export async function semantic_search(params: semanticSearchparams) {
  const match_count = params.match_count || 8;
  const match_threshold = params.match_threshold || 0.5;
  const similarity = sql<number>`1 - (${cosineDistance(vectorEmbedding.embedding, params.queryEmbedding)})`;

  const result = await db
    .select({
      bookmarkId: usersBookmarks.id,
      url: usersBookmarks.url,
      title: globalBookmarks.title,
      jobStatus: globalJobsBookmarks.status,
      similarity,
    })
    .from(usersBookmarks)
    .innerJoin(
      globalBookmarks,
      eq(usersBookmarks.globalBookmarkId, globalBookmarks.id)
    )
    .innerJoin(
      bookmarkContent,
      eq(globalBookmarks.bookmarkContentId, bookmarkContent.id)
    )
    .innerJoin(
      splitContent,
      eq(bookmarkContent.id, splitContent.bookmarkContentId)
    )
    .innerJoin(
      globalJobsBookmarks,
      eq(globalJobsBookmarks.globalBookmarkId, globalBookmarks.id)
    )
    .innerJoin(
      vectorEmbedding,
      eq(splitContent.id, vectorEmbedding.splitContentId)
    )
    .where(
      and(
        eq(usersBookmarks.userId, params.userId),
        gt(similarity, match_threshold)
      )
    )
    .orderBy((t) => desc(t.similarity))
    .limit(match_count);

  return result;
}

export async function hybrid_search(params: hybridParmas) {
  const k = params.rrf_contant ?? 60;

  // starting both queries in parallel
  const [kwHits, semHits] = await Promise.all([
    keyword_search({
      query: params.query,
      userId: params.userId,
      match_count: params.match_count,
    }),
    semantic_search({
      queryEmbedding: params.queryEmbedding,
      userId: params.userId,
      match_count: params.match_count,
      match_threshold: params.match_threshold,
    }),
  ]);

  // rank maps
  const kwRank = new Map<string, number>();
  kwHits.forEach(
    (
      hit: {
        bookmarkId: string;
      },
      idx: number
    ) => kwRank.set(hit.bookmarkId, idx + 1)
  );

  const semRank = new Map<string, number>();
  semHits.forEach(
    (
      hit: {
        bookmarkId: string;
      },
      idx: number
    ) => semRank.set(hit.bookmarkId, idx + 1)
  );

  // all unique IDs
  const allIds = new Set<string>([...kwRank.keys(), ...semRank.keys()]);

  // rrf score compute
  const fused: Array<rrfFusedArr> = [];

  // full record from lists
  for (const id of allIds) {
    const kwRec = kwHits.find(
      (r: { bookmarkId: string }) => r.bookmarkId === id
    );
    const semRec = kwHits.find(
      (r: { bookmarkId: string }) => r.bookmarkId === id
    );

    const rankKw = kwRank.get(id) ?? params.match_count + 1;
    const rankSem = semRank.get(id) ?? params.match_count + 1;

    const score = 1 / (k + rankKw) + 1 / (k + rankSem);

    // metadata
    const rec: {
      bookmarkId: string;
      url: string;
      title: string;
      jobStatus: string;
    } = kwRec ?? semRec!;
    fused.push({
      bookmarkId: id,
      url: rec.url,
      title: rec.title,
      jobStatus: rec.jobStatus,
      rrfScore: score,
    });
  }

  // sort and trim
  fused.sort((a, b) => b.rrfScore - a.rrfScore);
  return fused.slice(0, params.match_count);
}
