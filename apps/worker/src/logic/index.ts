import { Job } from "bullmq";
import Scrapper from "../services/scrapper";
import { db } from "@repo/database/database";
import { globalJobsBookmarks } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import splitter from "../services/splitter";
import { SplitInsertResult } from "../types/returnTypes";

async function JobHandler(params: Job) {
  try {
    const { url, globalBookmarkId } = params.data;
    const JobBookmarkData = await db.query.globalJobsBookmarks.findFirst({
      where: eq(globalJobsBookmarks.globalBookmarkId, globalBookmarkId),
    });
    if (JobBookmarkData && JobBookmarkData?.status !== "scraped") {
      // scrape
      const { bookmarkContentId, textContent } = await Scrapper(url);
      // split
      const splitTexts: SplitInsertResult[] = await splitter({
        bookmarkContentId,
        textContent,
      });

      // embed
      

    }
  } catch (err) {
    throw err;
  }
}

export default JobHandler;
