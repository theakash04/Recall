import { Readability } from "@mozilla/readability";
import axios from "axios";
import { eq } from "drizzle-orm";
import { JSDOM } from "jsdom";
import updateJobStatus from "../utils/updateJobStatus";
import isStepAlreadyDone from "../utils/checkJobStatus";
import { hashTextContent } from "../utils/hashHelper";
import { JobBookmarks } from "../../types/dbTypes";
import { db } from "../../database/dbConnect";
import { bookmarkContent, globalBookmarks } from "../../database/schema";

type scrapperParams = JobBookmarks & {
  url: string;
};

function cleanTextContent(rawText: string): string {
  return rawText
    .replace(/\r/g, "") // Remove carriage returns
    .replace(/\t/g, " ") // Replace tabs with single spaces
    .replace(/\s{2,}/g, " ") // Collapse multiple spaces into one
    .replace(/\n{3,}/g, "\n\n") // Collapse 3+ newlines into just 2 (paragraph breaks)
    .trim(); // Remove leading/trailing whitespace
}

async function Scrapper(params: scrapperParams) {
  const done = await isStepAlreadyDone({
    jobId: params.jobId,
    expectedStatus: "pending",
  });

  if (done) {
    console.log("Scrapper: step already done, skipping");
    return;
  }

  try {
    const html = await axios.get(params.url).then((res) => res.data as string);
    const doc = new JSDOM(html, { url: params.url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article) {
      throw new Error("Failed to parse article content.");
    }
    const { title, textContent } = article;
    if (!title || !textContent) {
      throw new Error("No title or text content found!");
    }

    const cleanContent = cleanTextContent(textContent);
    const contentHash = await hashTextContent(cleanContent);

    const existingContent = await db
      .select({ id: bookmarkContent.id })
      .from(bookmarkContent)
      .where(eq(bookmarkContent.contentHash, contentHash))
      .limit(1)
      .then((rows) => rows[0]);

    let contentId: string;

    if (existingContent) {
      contentId = existingContent.id;
    } else {
      const inserted = await db
        .insert(bookmarkContent)
        .values({
          content: cleanContent,
          contentHash,
        })
        .returning({ insertedId: bookmarkContent.id });

      if (!inserted[0]?.insertedId) {
        throw new Error("Bookmark Content not saved properly!");
      }

      contentId = inserted[0].insertedId;
    }

    // Updating title and connecting global bookmark to bookmarkContent
    await db
      .update(globalBookmarks)
      .set({
        title: title,
        bookmarkContentId: contentId,
      })
      .where(eq(globalBookmarks.id, params.globalBookmarkId));

    // updating the job status in db
    await updateJobStatus({
      globalBookmarkId: params.globalBookmarkId,
      status: "scraped",
      error: "",
      isFailed: false,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    await updateJobStatus({
      globalBookmarkId: params.globalBookmarkId,
      isFailed: true,
      error: errorMessage,
    });
    throw err;
  }
}

export default Scrapper;
