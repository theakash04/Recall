import { db } from "@repo/database/database";
import { sql } from "drizzle-orm";
import {
  hybridParams,
  JobStatusType,
  KeywordSearchParams,
  searchResult,
  semanticSearchparams,
  urlSearchParams,
  urlSearchReturn,
} from "../types/searchTypes";

// constant term
const match_count = 8;
const match_threshold = 0.5;

/**
 * Performs a URL search on the bookmarks database.
 * @param {urlSearchParams} params - The parameters for the search.
 * @returns {Promise<urlSearchReturn[]>} - The search results.
 */
async function url_search(params: urlSearchParams): Promise<urlSearchReturn[]> {
  const rows = await db.execute(sql`
  SELECT 
    ub.id AS "bookmarkId",
    ub.url,
    gb.title,
    gjb.status AS "jobStatus",
    gjb.is_failed AS "isFailed",
    gjb.error,
    ub.created_at AS "createdAt"
  FROM users_bookmarks ub
  LEFT JOIN global_bookmarks gb ON ub.global_bookmark_id = gb.id
  LEFT JOIN global_jobs_bookmarks gjb ON gb.id = gjb.global_bookmark_id
  WHERE ub.user_id = ${params.userId} AND ub.url ILIKE ${`%${params.query}%`}
`);

  return Array.from(rows).map(
    (row): urlSearchReturn => ({
      bookmarkId: row.bookmarkId as string,
      url: row.url as string,
      title: row.title as string,
      jobStatus: row.jobStatus as string,
      isFailed: row.isFailed as boolean,
      error: row.error as string,
      createdAt: row.createdAt as Date,
    })
  );
}

/**
 * Performs a keyword search on the bookmarks database.
 * @param {KeywordSearchParams} params - The parameters for the search.
 * @returns {Promise<searchResult[]>} - The search results.
 */
async function keyword_search(
  params: KeywordSearchParams
): Promise<searchResult[]> {
  const match_count = 8;

  const query = sql`websearch_to_tsquery('english', ${params.query})`;
  const result = await db.execute(sql`
  SELECT 
    ub.id AS "bookmarkId",
    ub.url,
    gb.title,
    gjb.status AS "jobStatus",
    gjb.is_failed AS "isFailed",
    gjb.error,
    ub.created_at AS "createdAt",
    MAX(ts_rank(sc.content_search || to_tsvector('english', gb.title), ${query})) AS rank
  FROM users_bookmarks ub
  INNER JOIN global_bookmarks gb ON ub.global_bookmark_id = gb.id
  INNER JOIN bookmark_content bc ON gb.bookmark_content_id = bc.id
  INNER JOIN split_content sc ON bc.id = sc.bookmark_content_id
  INNER JOIN global_jobs_bookmarks gjb ON gjb.global_bookmark_id = gb.id
  WHERE ub.user_id = ${params.userId}
    AND (sc.content_search || to_tsvector('english', gb.title)) @@ ${query}
  GROUP BY 
    ub.id, ub.url, gb.title, gjb.status, gjb.is_failed, gjb.error, ub.created_at
  ORDER BY rank DESC
  LIMIT ${match_count}
`);

  return Array.from(result).map((row) => ({
    bookmarkId: row.bookmarkId as string,
    url: row.url as string,
    title: row.title as string,
    jobStatus: row.jobStatus as JobStatusType,
    isFailed: row.isFailed as boolean,
    error: row.error as string,
    rank: row.rank as number,
    createdAt: row.createdAt as Date,
  }));
}

/**
 * Performs a semantic search on the bookmarks database.
 * @param {semanticSearchparams} params - The parameters for the search.
 * @returns {Promise<searchResult[]>} - The search results.
 */
async function semantic_search(
  params: semanticSearchparams
): Promise<searchResult[]> {
  const vectorString = `[${params.queryEmbedding.join(",")}]`;
  const result = await db.execute(sql`
SELECT DISTINCT ON (ub.id)
  ub.id AS "bookmarkId",
  ub.url,
  gb.title,
  gjb.status AS "jobStatus",
  gjb.is_failed AS "isFailed",
  gjb.error,
  ub.created_at AS "createdAt",
  (1 - (ve.embedding <=> ${vectorString}::vector)) AS similarity
FROM users_bookmarks ub
INNER JOIN global_bookmarks gb ON ub.global_bookmark_id = gb.id
INNER JOIN bookmark_content bc ON gb.bookmark_content_id = bc.id
INNER JOIN split_content sc ON bc.id = sc.bookmark_content_id
INNER JOIN global_jobs_bookmarks gjb ON gjb.global_bookmark_id = gb.id
INNER JOIN vector_embedding ve ON sc.id = ve.split_content_id
WHERE ub.user_id = ${params.userId}
  AND (1 - (ve.embedding <=> ${vectorString}::vector)) > ${match_threshold}
ORDER BY ub.id, similarity DESC
LIMIT ${match_count}
  `);

  return Array.from(result).map((row) => ({
    bookmarkId: row.bookmarkId as string,
    url: row.url as string,
    title: row.title as string,
    jobStatus: row.jobStatus as JobStatusType,
    isFailed: row.isFailed as boolean,
    error: row.error as string,
    similarity: row.similarity as number,
    createdAt: row.createdAt as Date,
  }));
}

/**
 * Performs a hybrid search combining keyword and semantic search.
 * @param {hybridParams} params - The parameters for the hybrid search.
 * @returns {Promise<searchResult[]>} - The search results.
 */
async function hybrid_search(params: hybridParams): Promise<searchResult[]> {
  const k = params.rrf_constant ?? 60;

  // starting both queries in parallel
  const [kwHits, semHits] = await Promise.all([
    keyword_search({
      query: params.query,
      userId: params.userId,
    }),
    semantic_search({
      queryEmbedding: params.queryEmbedding,
      userId: params.userId,
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
    const semRec = semHits.find(
      (r: { bookmarkId: string }) => r.bookmarkId === id
    );

    const rec = kwRec ?? semRec;
    if (!rec) continue;

    const rankKw = kwRank.get(id) ?? match_count + 1;
    const rankSem = semRank.get(id) ?? match_count + 1;

    const score = 1 / (k + rankKw) + 1 / (k + rankSem);

    // metadata
    fused.push({
      bookmarkId: id,
      url: rec.url,
      title: rec.title,
      jobStatus: rec.jobStatus,
      isFailed: rec.isFailed,
      error: rec.error,
      rrfScore: score,
      createdAt: rec.createdAt,
    });
  }


  // sort and trim
  fused.sort((a, b) => b.rrfScore! - a.rrfScore!);
  return fused.slice(0, match_count);
}

export { keyword_search, semantic_search, url_search, hybrid_search };
