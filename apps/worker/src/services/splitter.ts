import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { SplitInsertResult } from "../types/returnTypes";
import crypto from "crypto";
import { db } from "@repo/database/database";
import { splitContent } from "@repo/database/schema";

type splitterParams = {
  bookmarkContentId: string;
  textContent: string;
};

// ✅ Helper: Hash function
async function hashTextContent(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

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
async function splitter(params: splitterParams): Promise<SplitInsertResult[]> {
  try {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 200,
    });

    const splittedText = await textSplitter.createDocuments([
      params.textContent,
    ]);

    const result: SplitInsertResult[] = await Promise.all(
      splittedText.map(async (doc): Promise<SplitInsertResult> => {
        const splitContentId = await insertToDB({
          content: doc.pageContent,
          bookmarkContentId: params.bookmarkContentId,
        });

        return {
          splitContentId,
          text: doc.pageContent,
        };
      })
    );

    return result;
  } catch (err) {
    throw err;
  }
}

export default splitter;
