import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid, varchar, vector } from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

export const usersBookmarks = pgTable('users_bookmarks', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  globalBookmarkId: uuid('global_bookmark_id')
    .notNull()
    .references(() => globalBookmarks.id, { onDelete: 'cascade' }),
  rawUrl: text('raw_url')
    .unique()
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  globalBookmarkIdIdx: index('global_bookmark_id_idx').on(table.globalBookmarkId)
}));

export const globalBookmarks = pgTable('global_bookmarks', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),
  url: text('url')
    .notNull()
    .unique(),
  urlHash: varchar('url_hash', { length: 64 })
    .notNull()
    .unique(),
  bookmarkContentId: uuid('bookmark_content_id')
    .notNull()
    .references(() => bookmarkContent.id, { onDelete: 'cascade' })
});

export const bookmarkContent = pgTable('bookmark_content', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),
  content: text('content')
    .notNull(),
});

export const splitContent = pgTable('split_content', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),
  bookmarkContentId: uuid('bookmark_content_id')
    .notNull()
    .references(() =>
      bookmarkContent.id, { onDelete: 'cascade' }
    ),
  contentChunk: text('content_chunk')
    .notNull()
    .unique()
  ,
  contentChunkHash: varchar('content_chunk_hash', { length: 64 })
    .notNull()
    .unique(),
}, (table) => ({
  bookmarkContentIdIdx: index('bookmark_content_id_idx').on(table.bookmarkContentId)
}));

export const vectorEmbedding = pgTable('vector_embedding', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),
  splitContentId: uuid('split_content_id')
    .notNull()
    .references(() => splitContent.id, { onDelete: 'cascade' }),
  embedding: vector('embedding', { dimensions: 1536 })
}, (table) => ([
  index('l2_index').using('ivfflat', table.embedding.op('vector_l2_ops')),
  index('split_content_id_idx').on(table.splitContentId),
  index('cosine_index').using('ivfflat', table.embedding.op('vector_cosine_ops'))
]))


// relations of tables
export const userBookmarksRelations = relations(usersBookmarks, ({ one }) => ({
  user: one(authUsers, {
    fields: [usersBookmarks.userId],
    references: [authUsers.id],
  }),
  globalBookmarks: one(globalBookmarks, {
    fields: [usersBookmarks.globalBookmarkId],
    references: [globalBookmarks.id],
  })
}));

export const globalBookmarksRelations = relations(globalBookmarks, ({ one }) => ({
  bookmarkContent: one(bookmarkContent, {
    fields: [globalBookmarks.bookmarkContentId],
    references: [bookmarkContent.id],
  }),
}))

export const bookmarkContentRelations = relations(bookmarkContent, ({ many }) => ({
  splitContent: many(splitContent)
}));

export const splitContentRelations = relations(splitContent, ({ one }) => ({
  bookmarkContent: one(bookmarkContent, {
    fields: [splitContent.bookmarkContentId],
    references: [bookmarkContent.id],
  }),
}))

export const vectorEmbeddingRelations = relations(vectorEmbedding, ({ one }) => ({
  splitContent: one(splitContent, {
    fields: [vectorEmbedding.splitContentId],
    references: [splitContent.id],
  })
}))

