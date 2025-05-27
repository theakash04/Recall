import { Worker, Job } from "bullmq";
import { configDotenv } from "dotenv";
import JobHandler from "./logic";
import updateJobStatus from "./utils/updateJobStatus";
configDotenv();

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
      await JobHandler(job);
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
