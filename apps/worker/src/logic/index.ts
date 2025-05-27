import { Job } from "bullmq";
import Scrapper from "../services/scrapper";
import { db } from "@repo/database/database";
import { globalJobsBookmarks } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import splitter from "../services/splitter";
import embedContent from "../services/embedContent";
import updateJobStatus from "../utils/updateJobStatus";

async function JobHandler(job: Job) {
  const jobId = job.id;
  const url = job.data.url;

  console.log("came here")
  const dbJob = await db
    .select()
    .from(globalJobsBookmarks)
    .where(eq(globalJobsBookmarks.jobId, jobId!))
    .limit(1)
    .then((rows) => rows[0]);
  console.log(dbJob)

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
      console.log("Job already completed skipping!");
      break;
    default:
      console.log("This case is not handled in switch statement.");
      break;
  }
}

export default JobHandler;
