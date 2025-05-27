import dotenv from "dotenv";
import geminiEmbedding from "@repo/utils/genEmbeddings";
import updateJobStatus from "../utils/updateJobStatus";
import isStepAlreadyDone from "../utils/checkJobStatus";
import { JobBookmarks } from "@repo/database/types";
import { db } from "@repo/database/database";
import {
  globalBookmarks,
  splitContent,
  vectorEmbedding,
} from "@repo/database/schema";
import { eq } from "drizzle-orm";

dotenv.config();

const GEMINI_API = process.env.GEMINI_API || "";

if (!GEMINI_API || GEMINI_API === "") {
  throw new Error("Missing Google Gemini API key in .env");
}

async function saveToDB(params: {
  splitContentId: string;
  embedding: number[];
}) {
  try {
    await db.insert(vectorEmbedding).values({
      splitContentId: params.splitContentId,
      embedding: params.embedding,
    });
  } catch (err) {
    throw new Error(`DB insert failed for ID ${params.splitContentId}: ${err}`);
  }
}

type EmbeddingResult = {
  splitContentId: string;
  text: string;
  embedding: number[];
};

async function embedContent(params: JobBookmarks) {
  const done: boolean = await isStepAlreadyDone({
    jobId: params.jobId,
    expectedStatus: "splitted",
  });

  if (done) {
    console.log("embedContent: step is already done. skipping...");
    return;
  }

  const splitContentData = await db
    .select()
    .from(globalBookmarks)
    .where(eq(globalBookmarks.id, params.globalBookmarkId))
    .limit(1)
    .then(async (rows) => {
      const globalBookmarkData = rows[0];
      if (!globalBookmarkData?.bookmarkContentId) {
        throw new Error(`BookmarkContent id is not present! ${params.jobId}`);
      }
      return await db
        .select()
        .from(splitContent)
        .where(
          eq(
            splitContent.bookmarkContentId,
            globalBookmarkData?.bookmarkContentId
          )
        );
    });

  // get IDs of already embedded content
  const alreadyEmbedded = await db
    .select({ splitContentId: vectorEmbedding.splitContentId })
    .from(vectorEmbedding);

  const embeddedSet = new Set(alreadyEmbedded.map((e) => e.splitContentId));

  // filter out already embedded content
  const toEmbed = splitContentData.filter((data) => !embeddedSet.has(data.id));

  if (toEmbed.length === 0) {
    console.log("All content already embedded. skipping embedding step!");
  } else {
    const Content = (await geminiEmbedding({
      API_KEY: GEMINI_API,
      content: toEmbed.map((data) => ({
        splitContentId: data.id,
        text: data.contentChunk,
      })),
    })) as EmbeddingResult[];

    if (!Content) {
      throw new Error("Content not embedded!");
    }

    // saving the embeddings
    await Promise.all(
      Content.filter((data) => !!data.embedding).map((data) =>
        saveToDB({
          splitContentId: data.splitContentId!,
          embedding: data.embedding!,
        })
      )
    );
  }

  // update job status
  await updateJobStatus({
    globalBookmarkId: params.globalBookmarkId,
    error: "",
    isFailed: false,
    status: "embedded",
  });
}

export default embedContent;
