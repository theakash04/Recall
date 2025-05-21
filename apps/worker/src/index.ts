import { Worker, Job } from 'bullmq';
import { configDotenv } from 'dotenv';

configDotenv();

const REDIS_URL = process.env.REDIS_STR;
if (!REDIS_URL) {
  console.log("No Redis URL in environment variables.");
  process.exit(1);
}

const worker = new Worker(
  'bookmarks',
  async (job: Job) => {
    try {
      console.log(`Processing job ${job.id} with data:`, job.data);
      return 'Job completed successfully';
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
  console.log("Worker is ready ")
})


worker.on('completed', (job: any) => {
  console.log(`Job ${job.id} has been completed`);
  // add status as complete in db;
});

worker.on('failed', (job: any, err) => {
  console.error(`Job ${job.id} has failed with error: ${err.message}`);
  // add status as failed on db;
});

