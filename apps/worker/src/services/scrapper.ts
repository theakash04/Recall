import { Readability } from "@mozilla/readability";
import { db } from "@repo/database/database";
import { bookmarkContent, globalBookmarks } from "@repo/database/schema";
import axios from "axios";
import { eq } from "drizzle-orm";
import { JSDOM } from "jsdom";
import updateJobStatus from "../utils/updateJobStatus";

type scrapperParams = {
  url: string;
  globalBookmarkId: string;
};

async function Scrapper(params: scrapperParams) {
  try {
    const html = await axios.get(params.url).then((res) => res.data);
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

    // saving bookmarks
    const bookmarkContentSaved = await db
      .insert(bookmarkContent)
      .values({
        content: textContent,
      })
      .returning({ insertedId: bookmarkContent.id });

    if (!bookmarkContentSaved[0]?.insertedId) {
      throw new Error("Bookmark Content not saved properly!");
    }

    // Updating title and connecting global bookmark to bookmarkContent
    await db
      .update(globalBookmarks)
      .set({
        title: title,
        bookmarkContentId: bookmarkContentSaved[0]?.insertedId,
      })
      .where(eq(globalBookmarks.id, params.globalBookmarkId));

    // updating the job status in db
    await updateJobStatus({
      globalBookmarkId: params.globalBookmarkId,
      status: "scraped",
      error: "",
      isFailed: false,
    });
    return {
      bookmarkContentId: bookmarkContentSaved[0].insertedId,
      textContent,
    };
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
