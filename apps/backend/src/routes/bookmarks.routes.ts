import { Request, Response, Router } from "express";
import { addUrlSchema, getQuerySchema } from "../types/zod/bookmarks";
import isUrlScrapable from "../utils/urlScrapableChecker";
import * as schema from "@repo/database/schema";
import { db } from "@repo/database/database";
import { and, eq,  sql } from "drizzle-orm";
import canonicalize from "../utils/urlCanonicalizer";
import { addJob } from "../utils/jobScheduler";
import { url_search } from "../services/searchServices";

const router: Router = Router();

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

  // pass to zod for validation
  const queryParams = getQuerySchema.safeParse({
    query: req.query.string || req.query.url,
    match_count: req.query.match_count,
    match_threshold: req.query.match_threshold,
  });

  if (!queryParams.success) {
    res.status(400).json({
      error: queryParams.error.format(),
    });
    return;
  }
  const { query, match_count, match_threshold } = queryParams.data;

  // implement logic of search with url
  try {
    const isURL = new URL(query as string);

    if (isURL) {
      // create a sep function for this
      const results = await url_search({
        query: query as string,
        userId: user.id,
      });

      res.status(200).json({
        data: results,
        message: "Searched data fetched!",
        size: results.length,
      });
    }

    // with keyword and semantic (hybrid)
  } catch (err) {
    res.status(500).json({
      message: "Something Unexpected happend!",
    });
  }
});

router.get("/get-all-bookmarks", async (req: Request, res: Response) => {
  const user = (req as any).user;

  try {
    const bookmarks = await db.execute(sql`
      SELECT 
        ub.id AS "userBookmarkId",
        ub.url,
        gb.id AS "globalBookmarksId",
        gjb.status AS "jobStatus",
        gjb.error AS "jobError",
        ub.created_at AS "createdAt"
        FROM users_bookmarks ub
        LEFT JOIN global_bookmarks gb 
        ON ub.global_bookmark_id = gb.id
        LEFT JOIN global_jobs_bookmarks gjb 
        ON gb.id = gjb.global_bookmark_id
        WHERE ub.user_id = ${user.id}
    `);

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
