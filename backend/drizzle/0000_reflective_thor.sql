CREATE TABLE "bookmark_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "global_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"url_hash" varchar(64) NOT NULL,
	"bookmark_content_id" uuid NOT NULL,
	CONSTRAINT "global_bookmarks_url_unique" UNIQUE("url"),
	CONSTRAINT "global_bookmarks_url_hash_unique" UNIQUE("url_hash")
);
--> statement-breakpoint
CREATE TABLE "split_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bookmark_content_id" uuid NOT NULL,
	"content_chunk" text NOT NULL,
	"content_chunk_hash" varchar(64) NOT NULL,
	CONSTRAINT "split_content_content_chunk_unique" UNIQUE("content_chunk"),
	CONSTRAINT "split_content_content_chunk_hash_unique" UNIQUE("content_chunk_hash")
);
--> statement-breakpoint
CREATE TABLE "users_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"global_bookmark_id" uuid NOT NULL,
	"raw_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_bookmarks_raw_url_unique" UNIQUE("raw_url")
);
--> statement-breakpoint
CREATE TABLE "vector_embedding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"split_content_id" uuid NOT NULL,
	"embedding" vector(1536)
);
--> statement-breakpoint
ALTER TABLE "global_bookmarks" ADD CONSTRAINT "global_bookmarks_bookmark_content_id_bookmark_content_id_fk" FOREIGN KEY ("bookmark_content_id") REFERENCES "public"."bookmark_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_content" ADD CONSTRAINT "split_content_bookmark_content_id_bookmark_content_id_fk" FOREIGN KEY ("bookmark_content_id") REFERENCES "public"."bookmark_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_bookmarks" ADD CONSTRAINT "users_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_bookmarks" ADD CONSTRAINT "users_bookmarks_global_bookmark_id_global_bookmarks_id_fk" FOREIGN KEY ("global_bookmark_id") REFERENCES "public"."global_bookmarks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vector_embedding" ADD CONSTRAINT "vector_embedding_split_content_id_split_content_id_fk" FOREIGN KEY ("split_content_id") REFERENCES "public"."split_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookmark_content_id_idx" ON "split_content" USING btree ("bookmark_content_id");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "users_bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "global_bookmark_id_idx" ON "users_bookmarks" USING btree ("global_bookmark_id");--> statement-breakpoint
CREATE INDEX "l2_index" ON "vector_embedding" USING ivfflat ("embedding" vector_l2_ops);--> statement-breakpoint
CREATE INDEX "split_content_id_idx" ON "vector_embedding" USING btree ("split_content_id");--> statement-breakpoint
CREATE INDEX "cosine_index" ON "vector_embedding" USING ivfflat ("embedding" vector_cosine_ops);
