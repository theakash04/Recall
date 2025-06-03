import { eq } from "drizzle-orm";
import { db } from "../../database/dbConnect";
import { globalJobsBookmarks } from "../../database/schema";

type isStepsAlreadyDoneParams = {
  jobId: string;
  expectedStatus: string;
};

export default async function isStepAlreadyDone({
  jobId,
  expectedStatus,
}: isStepsAlreadyDoneParams): Promise<boolean> {
  const job = await db
    .select()
    .from(globalJobsBookmarks)
    .where(eq(globalJobsBookmarks.jobId, jobId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!job) throw new Error(`Job not Found: ${jobId}`);

  const statusOrder = [
    "pending",
    "scraped",
    "splitted",
    "embedded",
    "completed",
  ];

  return statusOrder.indexOf(job.status) > statusOrder.indexOf(expectedStatus);
}
