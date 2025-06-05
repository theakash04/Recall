import { relations, SQL, sql, Table } from "drizzle-orm";
import { boolean } from "drizzle-orm/pg-core";
import { PgColumn } from "drizzle-orm/pg-core";
import { integer } from "drizzle-orm/pg-core";
import { check } from "drizzle-orm/pg-core";
import {
  customType,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

export const jobStatusEnum = pgEnum("status", [
  "pending",
  "scraped",
  "splitted",
  "embedded",
  "completed",
]);
import { authUsers } from "drizzle-orm/supabase";

const tsVector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const userFeedback = pgTable(
  "user_feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id as unknown as PgColumn<any>),
    rating: integer("rating").notNull(),
    feedback: text("feedback"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("rating_check", sql`${table.rating} >= 1 AND ${table.rating} <=5`),
  ]
);

export const usersBookmarks = pgTable(
  "users_bookmarks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id as unknown as PgColumn<any>, {
        onDelete: "cascade",
      }),
    globalBookmarkId: uuid("global_bookmark_id")
      .notNull()
      .references(() => globalBookmarks.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("user_id_idx").on(table.userId),
    index("global_bookmark_id_idx").on(table.globalBookmarkId),
  ]
);

export const globalJobsBookmarks = pgTable("global_jobs_bookmarks", {
  id: uuid("id").defaultRandom().primaryKey(),
  globalBookmarkId: uuid("global_bookmark_id")
    .notNull()
    .references(() => globalBookmarks.id, { onDelete: "cascade" }),
  jobId: text("job_id").notNull(),
  status: jobStatusEnum().notNull().default("pending"),
  isFailed: boolean("is_failed").default(false),
  error: text("error"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const globalBookmarks = pgTable("global_bookmarks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull().default("UNKNOWN"),
  url: text("url").notNull().unique(),
  urlHash: varchar("url_hash", { length: 64 }).notNull().unique(),
  bookmarkContentId: uuid("bookmark_content_id").references(
    () => bookmarkContent.id,
    { onDelete: "cascade" }
  ),
});

export const bookmarkContent = pgTable("bookmark_content", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  contentHash: varchar("content_hash", { length: 64 }).notNull().unique(),
});

export const splitContent = pgTable(
  "split_content",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookmarkContentId: uuid("bookmark_content_id")
      .notNull()
      .references(() => bookmarkContent.id, { onDelete: "cascade" }),
    contentChunk: text("content_chunk").notNull().unique(),
    contentSearch: tsVector("content_search").generatedAlwaysAs(
      (): SQL => sql`to_tsvector('english', ${splitContent.contentChunk})`
    ),
    contentChunkHash: varchar("content_chunk_hash", { length: 64 })
      .notNull()
      .unique(),
  },
  (table) => [
    index("bookmark_content_id_idx").on(table.bookmarkContentId),
    index("idx_content_search").using("gin", table.contentSearch),
  ]
);

export const vectorEmbedding = pgTable(
  "vector_embedding",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    splitContentId: uuid("split_content_id")
      .notNull()
      .references(() => splitContent.id, { onDelete: "cascade" }),
    embedding: vector("embedding", { dimensions: 768 }),
  },
  (table) => [
    // index("l2_index").using("ivfflat", table.embedding.op("vector_l2_ops")),
    index("split_content_id_idx").on(table.splitContentId),
    index("hnsw_cosine_index").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

// relations of tables
export const userBookmarksRelations = relations(usersBookmarks, ({ one }) => ({
  user: one(authUsers as unknown as Table<any>, {
    fields: [usersBookmarks.userId],
    references: [authUsers.id as unknown as PgColumn<any>],
  }),
  globalBookmarks: one(globalBookmarks, {
    fields: [usersBookmarks.globalBookmarkId],
    references: [globalBookmarks.id],
  }),
}));

export const userFeedbackRelations = relations(userFeedback, ({ one }) => ({
  user: one(authUsers as unknown as Table<any>, {
    fields: [userFeedback.userId],
    references: [authUsers.id as unknown as PgColumn<any>],
  }),
}));

export const globalBookmarksRelations = relations(
  globalBookmarks,
  ({ one }) => ({
    bookmarkContent: one(bookmarkContent, {
      fields: [globalBookmarks.bookmarkContentId],
      references: [bookmarkContent.id],
    }),
  })
);

export const bookmarkContentRelations = relations(
  bookmarkContent,
  ({ many }) => ({
    splitContent: many(splitContent),
  })
);

export const splitContentRelations = relations(splitContent, ({ one }) => ({
  bookmarkContent: one(bookmarkContent, {
    fields: [splitContent.bookmarkContentId],
    references: [bookmarkContent.id],
  }),
}));

export const vectorEmbeddingRelations = relations(
  vectorEmbedding,
  ({ one }) => ({
    splitContent: one(splitContent, {
      fields: [vectorEmbedding.splitContentId],
      references: [splitContent.id],
    }),
  })
);

export const globalJobsBookmarksRelations = relations(
  globalJobsBookmarks,
  ({ one }) => ({
    globalBookmark: one(globalBookmarks, {
      fields: [globalJobsBookmarks.globalBookmarkId],
      references: [globalBookmarks.id],
    }),
  })
);
