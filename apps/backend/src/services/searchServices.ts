import { db } from "@repo/database/database";
import {
  bookmarkContent,
  globalBookmarks,
  globalJobsBookmarks,
  splitContent,
  usersBookmarks,
  vectorEmbedding,
} from "@repo/database/schema";
import { and, cosineDistance, desc, eq, gt, ilike, sql } from "drizzle-orm";
import {
  hybridParams,
  KeywordSearchParams,
  searchResult,
  semanticSearchparams,
  urlSearchParams,
} from "../types/searchTypes";

/**
 * Performs a URL search on the bookmarks database.
 * @param {urlSearchParams} params - The parameters for the search.
 * @returns {Promise<any>} - The search results.
 */
async function url_search(params: urlSearchParams) {
  const result = await db.execute(sql`
  SELECT 
    ub.id AS "bookmarkId",
    ub.url,
    gb.title,
    gjb.status AS "jobStatus"
  FROM users_bookmarks ub
  LEFT JOIN global_bookmarks gb ON ub.global_bookmark_id = gb.id
  LEFT JOIN global_jobs_bookmarks gjb ON gb.id = gjb.global_bookmark_id
  WHERE ub.user_id = ${params.userId} AND ub.url ILIKE ${`%${params.query}%`}
`);

  return result;
}

/**
 * Performs a keyword search on the bookmarks database.
 * @param {KeywordSearchParams} params - The parameters for the search.
 * @returns {Promise<searchResult>} - The search results.
 */
async function keyword_search(
  params: KeywordSearchParams
): Promise<searchResult[]> {
  const match_count = params.match_count || 8;

  const query = sql`plainto_tsquery('english', ${params.query})`;
  const result = (await db.execute(sql`
  SELECT 
    ub.id AS "bookmarkId",
    ub.url,
    gb.title,
    gjb.status AS "jobStatus",
    ts_rank(sc.content_search, ${query}) AS rank
  FROM users_bookmarks ub
  INNER JOIN global_bookmarks gb ON ub.global_bookmark_id = gb.id
  INNER JOIN bookmark_content bc ON gb.bookmark_content_id = bc.id
  INNER JOIN split_content sc ON bc.id = sc.bookmark_content_id
  INNER JOIN global_jobs_bookmarks gjb ON gjb.global_bookmark_id = gb.id
  WHERE ub.user_id = ${params.userId}
    AND sc.content_search @@ ${query}
  ORDER BY ts_rank(sc.content_search, ${query}) DESC
  LIMIT ${match_count}
`)) as unknown as searchResult[];

  return result;
}

/**
 * Performs a semantic search on the bookmarks database.
 * @param {semanticSearchparams} params - The parameters for the search.
 * @returns {Promise<searchResult>} - The search results.
 */
async function semantic_search(
  params: semanticSearchparams
): Promise<searchResult[]> {
  const match_count = params.match_count || 8;
  const match_threshold = params.match_threshold || 0.5;
  const similarity = sql<number>`1 - (${cosineDistance(vectorEmbedding.embedding, params.queryEmbedding)})`;

  const result = (await db.execute(sql`
  SELECT 
    ub.id AS "bookmarkId",
    ub.url,
    gb.title,
    gjb.status AS "jobStatus",
    ve.similarity
  FROM users_bookmarks ub
  INNER JOIN global_bookmarks gb ON ub.global_bookmark_id = gb.id
  INNER JOIN bookmark_content bc ON gb.bookmark_content_id = bc.id
  INNER JOIN split_content sc ON bc.id = sc.bookmark_content_id
  INNER JOIN global_jobs_bookmarks gjb ON gjb.global_bookmark_id = gb.id
  INNER JOIN vector_embedding ve ON sc.id = ve.split_content_id
  WHERE ub.user_id = ${params.userId}
    AND ve.similarity > ${match_threshold}
  ORDER BY ve.similarity DESC
  LIMIT ${match_count}
`)) as unknown as searchResult[];

  return result;
}

/**
 * Performs a hybrid search combining keyword and semantic search.
 * @param {hybridParams} params - The parameters for the hybrid search.
 * @returns {Promise<searchResult>} - The search results.
 */
async function hybrid_search(params: hybridParams): Promise<searchResult[]> {
  const k = params.rrf_constant ?? 60;

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
  const fused: Array<searchResult> = [];

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
    const rec: searchResult = kwRec ?? semRec!;
    fused.push({
      bookmarkId: id,
      url: rec.url,
      title: rec.title,
      jobStatus: rec.jobStatus,
      rrfScore: score,
    });
  }

  // sort and trim
  fused.sort((a, b) => b.rrfScore! - a.rrfScore!);
  return fused.slice(0, params.match_count);
}

export { keyword_search, semantic_search, url_search, hybrid_search };
