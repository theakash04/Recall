import { Request, Response, Router } from "express";
import { addUrlSchema, getQuerySchema } from "../types/zod/bookmarks";
import isUrlScrapable from "../utils/urlScrapableChecker";
import * as schema from "@repo/database/schema";
import { db } from "@repo/database/database";
import { and, desc, eq, sql } from "drizzle-orm";
import canonicalize from "../utils/urlCanonicalizer";
import { addJob } from "../utils/jobScheduler";
import {
  hybrid_search,
  keyword_search,
  semantic_search,
  url_search,
} from "../services/searchServices";
import { searchResult, urlSearchReturn } from "../types/searchTypes";
import geminiEmbedding from "@repo/utils/genEmbeddings";
import dotenv from "dotenv";
dotenv.config();

const router: Router = Router();
const GEMINI_API = process.env.GEMINI_API;
if (!GEMINI_API) {
  throw new Error("No api provided!");
}

router.post("/add-bookmark", async (req: Request, res: Response) => {
  const user = (req as any).user;

  // check if url is of
  const result = addUrlSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: result.error.format(),
    });
    return;
  }

  try {
    // normalize the url
    const { canonical: url, hash: hashUrl } = canonicalize(result.data.url);
    const isScrapable = await isUrlScrapable(url);

    if (!isScrapable) {
      res.status(400).json({
        error: "URL is not scrapable!",
      });
      return;
    }
    // check if url exists in user_bookmarks
    const existsInUsersBookmarks = await db.query.usersBookmarks.findFirst({
      where: and(
        eq(schema.usersBookmarks.userId, user.id),
        eq(schema.usersBookmarks.url, url)
      ),
    });

    if (existsInUsersBookmarks) {
      res.status(409).json({ error: "Bookmark already saved by user!" });
      return;
    }

    // checking if the url exist in global_bookmark
    const globalBookmark = await db.query.globalBookmarks.findFirst({
      where: eq(schema.globalBookmarks.urlHash, hashUrl),
    });

    if (globalBookmark) {
      const [newUserBookmark] = await db
        .insert(schema.usersBookmarks)
        .values({
          userId: user.id,
          globalBookmarkId: globalBookmark.id,
          url,
        })
        .returning();

      res.status(200).json({
        newUserBookmark,
        message: "Bookmark saved successfully!",
      });
      return;
    }
    const [newGlobalBookmark] = await db
      .insert(schema.globalBookmarks)
      .values({
        url,
        urlHash: hashUrl,
      })
      .returning();
    if (!newGlobalBookmark) {
      throw new Error("Failed to create global bookmark");
    }
    const [newUserBookmark] = await db
      .insert(schema.usersBookmarks)
      .values({
        userId: user.id,
        url,
        globalBookmarkId: newGlobalBookmark.id,
      })
      .returning();

    const isJobRunning = await db.query.globalJobsBookmarks.findFirst({
      where: eq(
        schema.globalJobsBookmarks.globalBookmarkId,
        newGlobalBookmark.id
      ),
    });

    if (!isJobRunning) {
      const jobData = {
        url,
        globalBookmarkId: newGlobalBookmark.id,
      };
      const newJob = await addJob(jobData);
      if (newJob.id && newGlobalBookmark.id) {
        await db.insert(schema.globalJobsBookmarks).values({
          jobId: newJob.id,
          globalBookmarkId: newGlobalBookmark.id,
        });
      }
    }

    res.status(200).json({
      data: {
        bookmark: newUserBookmark,
      },
      message: "Bookmark saved successfully!",
    });
    return;
  } catch (_err) {
    res.status(500).json({
      message: "Something Unexpected happend!",
    });
  }
});

router.get("/search", async (req: Request, res: Response) => {
  const user = (req as any).user;
  console.log(req.query)

  // pass to zod for validation
  const queryParams = getQuerySchema.safeParse({
    query: req.query.query || req.query.url,
    search_type: req.query.search_type,
  });

  if (!queryParams.success) {
    res.status(400).json({
      error: queryParams.error.format(),
    });
    return;
  }
  const { query, search_type } = queryParams.data;

  const validTypes = ["url", "keyword", "semantic", "hybrid"];
  if (!validTypes.includes(search_type)) {
    res.status(400).json({
      message: "Invalid search_type provided",
    });
    return;
  }


  // implement logic of search with url
  try {
    let results: urlSearchReturn[] | searchResult[] = [];
    let embedding: number[] = [];

    if (search_type !== "url") {
      embedding = (await geminiEmbedding({
        API_KEY: GEMINI_API,
        query,
      })) as number[];
    }

    switch (search_type) {
      case "url":
        results = await url_search({
          query: query as string,
          userId: user.id,
        });
        break;
      case "keyword":
        // keyword search
        results = await keyword_search({
          query,
          userId: user.id,
        });
        break;
      case "semantic":
        // semantic search
        results = await semantic_search({
          queryEmbedding: embedding,
          userId: user.id,
        });
        break;
      case "hybrid":
        // hybrid search
        results = await hybrid_search({
          query,
          queryEmbedding: embedding,
          userId: user.id,
        });
        break;
    }

    res.status(200).json({
      data: results,
      message: "Searched data fetched!",
      size: results.length,
    });
  } catch (err) {
    res.status(500).json({
      message: "Something Unexpected happend!",
    });
  }
});

router.get("/get-all-bookmarks", async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user?.id) {
    throw new Error("user Id is undefined");
  }

  try {
    const bookmarks = await db
      .select({
        bookmarkId: schema.usersBookmarks.id,
        url: schema.usersBookmarks.url,
        title: sql`gb.title`,
        isFailed: sql`gjb.is_failed`,
        jobStatus: sql`gjb.status`,
        error: sql`gjb.error`,
        createdAt: schema.usersBookmarks.createdAt,
      })
      .from(schema.usersBookmarks)
      .leftJoinLateral(
        db
          .select({
            title: schema.globalBookmarks.title,
          })
          .from(schema.globalBookmarks)
          .where(
            eq(
              schema.globalBookmarks.id,
              schema.usersBookmarks.globalBookmarkId
            )
          )
          .limit(1)
          .as("gb"),
        sql`TRUE`
      )
      .leftJoinLateral(
        db
          .select({
            status: schema.globalJobsBookmarks.status,
            isFailed: schema.globalJobsBookmarks.isFailed,
            error: schema.globalJobsBookmarks.error,
          })
          .from(schema.globalJobsBookmarks)
          .where(
            eq(
              schema.globalJobsBookmarks.globalBookmarkId,
              schema.usersBookmarks.globalBookmarkId
            )
          )
          .orderBy(desc(schema.globalJobsBookmarks.updatedAt))
          .limit(1)
          .as("gjb"),
        sql`TRUE`
      )
      .where(eq(schema.usersBookmarks.userId, user.id));


    res.status(200).json({
      data: bookmarks,
      message: "All bookmarks retrieved successfully!",
    });
  } catch (err) {
    console.error("Error fetching bookmarks:", err);
    res.status(500).json({
      error: "Something unexpected happened!",
    });
  }
});

export default router;
