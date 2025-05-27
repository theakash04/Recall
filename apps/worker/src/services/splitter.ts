import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { db } from "@repo/database/database";
import {
  bookmarkContent,
  globalBookmarks,
  splitContent,
} from "@repo/database/schema";
import { JobBookmarks } from "@repo/database/types";
import { eq } from "drizzle-orm";
import isStepAlreadyDone from "../utils/checkJobStatus";
import updateJobStatus from "../utils/updateJobStatus";
import { hashTextContent } from "../utils/hashHelper";

// ✅ Insert a split chunk to DB and return its ID
async function insertToDB({
  content,
  bookmarkContentId,
}: {
  content: string;
  bookmarkContentId: string;
}): Promise<string> {
  try {
    const contentHash = await hashTextContent(content);

    // checking if chunk already exists
    const existing = await db
      .select({ id: splitContent.id })
      .from(splitContent)
      .where(eq(splitContent.contentChunkHash, contentHash))
      .limit(1)
      .then((rows) => rows[0]);

    if (existing) {
      return existing.id;
    }

    const [inserted] = await db
      .insert(splitContent)
      .values({
        bookmarkContentId,
        contentChunk: content,
        contentChunkHash: contentHash,
      })
      .returning({ id: splitContent.id });
    if (!inserted) {
      throw new Error("Fail to save split content in db");
    }

    return inserted.id;
  } catch (err) {
    throw err;
  }
}

// ✅ Main function: Split and insert
async function splitter(params: JobBookmarks) {
  const done = await isStepAlreadyDone({
    jobId: params.jobId,
    expectedStatus: "scraped",
  });

  if (done) {
    console.log("Splitter: Step already done, skipping!");
    return;
  }

  const contentData = await db
    .select()
    .from(globalBookmarks)
    .where(eq(globalBookmarks.id, params.globalBookmarkId))
    .limit(1)
    .then(async (rows) => {
      const globalBookmark = rows[0];
      if (!globalBookmark?.bookmarkContentId) {
        throw new Error("Missing bookmarkContentId in globalBookmark");
      }
      return await db
        .select()
        .from(bookmarkContent)
        .where(eq(bookmarkContent.id, globalBookmark?.bookmarkContentId))
        .limit(1)
        .then((rows) => rows[0]);
    });

  if (!contentData) {
    throw new Error("No content found in the DB connected to globalBookmark");
  }

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500,
    chunkOverlap: 200,
  });

  const splittedText = await textSplitter.createDocuments([
    contentData?.content,
  ]);

  const result = await Promise.all(
    splittedText
      .filter((doc) => !!doc.pageContent)
      .map(async (doc) => {
        const splitContentId = await insertToDB({
          content: doc.pageContent,
          bookmarkContentId: contentData.id,
        });

        return {
          splitContentId,
          text: doc.pageContent,
        };
      })
  );

  await updateJobStatus({
    globalBookmarkId: params.globalBookmarkId,
    error: "",
    isFailed: false,
    status: "splitted",
  });

  if (!result) {
    throw new Error("Failed to save splitted content into the db!");
  }
}

export default splitter;
