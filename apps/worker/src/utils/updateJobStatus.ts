import { db } from "@repo/database/database";
import { globalJobsBookmarks } from "@repo/database/schema";
import { eq } from "drizzle-orm";

type UpdateJobStatusParams = {
  globalBookmarkId: string;
  status?: "pending" | "scraped" | "splitted" | "embedded" | "completed";
  error?: string;
  isFailed?: boolean;
};

async function updateJobStatus(params: UpdateJobStatusParams) {
  // Build the update object dynamically
  const updateObj: Record<string, any> = {};
  if (params.status !== undefined) updateObj.status = params.status;
  if (params.error !== undefined) updateObj.error = params.error;
  if (params.isFailed !== undefined) updateObj.isFailed = params.isFailed;

  if (Object.keys(updateObj).length === 0) {
    throw new Error("No update fields provided");
  }

  await db
    .update(globalJobsBookmarks)
    .set(updateObj)
    .where(eq(globalJobsBookmarks.globalBookmarkId, params.globalBookmarkId));
}

export default updateJobStatus;
