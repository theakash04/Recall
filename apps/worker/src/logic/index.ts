import { Job } from "bullmq";
import Scrapper from "../services/scrapper";
import { db } from "@repo/database/database";
import { globalJobsBookmarks } from "@repo/database/schema";
import { eq } from "drizzle-orm";

async function JobHandler(params: Job) {
  const { url, globalBookmarkId } = params.data;
  const status: string[] = ["pending", "scraped", "embedded", "completed", "failed"]
  const JobBookmarkData = await db.query.globalJobsBookmarks.findFirst({
    where: eq(globalJobsBookmarks.globalBookmarkId, globalBookmarkId),
  });
  if (
    JobBookmarkData?.status === "pending" ||
    JobBookmarkData?.status !== "scraped"
  ) {
    await Scrapper(url);

  }
}

export default JobHandler;
