import { Queue } from "bullmq";

const REDIS_URL = process.env.REDIS_STR;
if (!REDIS_URL) {
  console.log("No Redis URL in environment variables.");
  process.exit(1);
}

export const myQueue = new Queue("bookmarks", {
  connection: {
    url: REDIS_URL
  }
});

type jobType = {
  globalBookmarkId: string,
}

export const addJob = async (job: jobType) => {
  const customJobId = `bookmark_${job.globalBookmarkId}`
  const options = {
    attempts: 3,
    jobId: customJobId,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: true,
    removeOnFail: false
  };

  const data = await myQueue.add("bookmarkJob", job, options,);
  return data;
};

