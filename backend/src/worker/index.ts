import dotenv from "dotenv";
dotenv.config();

import { Worker, Job } from "bullmq";
import updateJobStatus from "./utils/updateJobStatus";
import { globalJobsBookmarks } from "../database/schema";
import { eq } from "drizzle-orm";
import Scrapper from "./services/scrapper";
import splitter from "./services/splitter";
import embedContent from "./services/embedContent";
import { db } from "../database/dbConnect";

const REDIS_URL = process.env.REDIS_STR;
if (!REDIS_URL) {
  console.log("No Redis URL in environment variables.");
  process.exit(1);
}

const worker = new Worker(
  "bookmarks",
  async (job: Job) => {
    try {
      console.log(`Processing job ${job.id} with data:`, job.data);
      const jobId = job.id;
      const url = job.data.url;

      const dbJob = await db
        .select()
        .from(globalJobsBookmarks)
        .where(eq(globalJobsBookmarks.jobId, jobId!))
        .limit(1)
        .then((rows) => rows[0]);

      if (!dbJob) {
        throw new Error(`No job found for ID: ${jobId}`);
      }

      switch (dbJob.status) {
        case "pending":
          await Scrapper({ ...dbJob, url });
        case "scraped":
          await splitter(dbJob);
        case "splitted":
          await embedContent(dbJob);
        case "embedded":
          await updateJobStatus({
            globalBookmarkId: dbJob.globalBookmarkId,
            error: "",
            isFailed: false,
            status: "completed",
          });
        case "completed":
          console.log("Job is Done!");
          break;
        default:
          console.log("This case is not handled in switch statement.");
          break;
      }
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection: {
      url: REDIS_URL,
    },
    concurrency: 5,
  }
);

worker.on("ready", () => {
  console.log("Worker is ready ");
});

worker.on("failed", async (job: Job | undefined, err) => {
  console.error(`Job ${job?.id} has failed with error: ${err.message}`);
  await updateJobStatus({
    globalBookmarkId: job?.data.globalBookmarkId,
    error: err.message,
    isFailed: true,
  });
});
