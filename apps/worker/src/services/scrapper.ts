import { Readability } from "@mozilla/readability";
import { db } from "@repo/database/database";
import {
  bookmarkContent,
  globalBookmarks,
  globalJobsBookmarks,
} from "@repo/database/schema";
import axios from "axios";
import { eq } from "drizzle-orm";
import { JSDOM } from "jsdom";

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
    // Updating title
    const titleSaved = await db
      .update(globalBookmarks)
      .set({
        title: title,
      })
      .where(eq(globalBookmarks.id, params.globalBookmarkId));

    if (!titleSaved) {
      throw new Error("Failed to add tittle to globalBookmarks");
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

    // updating the job status in db
    await db.update(globalJobsBookmarks).set({
      status: "scraped",
      error: "",
      isFailed: false,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    await db
      .update(globalJobsBookmarks)
      .set({
        status: "pending",
        isFailed: true,
        error: errorMessage,
      })
      .where(eq(globalJobsBookmarks.globalBookmarkId, params.globalBookmarkId));
  }
}

export default Scrapper;
