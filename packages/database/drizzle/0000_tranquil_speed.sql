DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status') THEN
    CREATE TYPE status AS ENUM ('pending', 'scraped', 'embedded', 'completed', 'failed');
  END IF;
END$$;
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookmark_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "global_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text DEFAULT 'UNKNOWN' NOT NULL,
	"url" text NOT NULL,
	"url_hash" varchar(64) NOT NULL,
	"bookmark_content_id" uuid,
	CONSTRAINT "global_bookmarks_url_unique" UNIQUE("url"),
	CONSTRAINT "global_bookmarks_url_hash_unique" UNIQUE("url_hash")
);
--> statement-breakpoint
CREATE TABLE "global_jobs_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"global_bookmark_id" uuid NOT NULL,
	"job_id" text NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"error" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "split_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bookmark_content_id" uuid NOT NULL,
	"content_chunk" text NOT NULL,
	"content_search" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', "split_content"."content_chunk")) STORED,
	"content_chunk_hash" varchar(64) NOT NULL,
	CONSTRAINT "split_content_content_chunk_unique" UNIQUE("content_chunk"),
	CONSTRAINT "split_content_content_chunk_hash_unique" UNIQUE("content_chunk_hash")
);
--> statement-breakpoint
CREATE TABLE "users_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"global_bookmark_id" uuid NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vector_embedding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"split_content_id" uuid NOT NULL,
	"embedding" vector(1536)
);
--> statement-breakpoint
ALTER TABLE "global_bookmarks" ADD CONSTRAINT "global_bookmarks_bookmark_content_id_bookmark_content_id_fk" FOREIGN KEY ("bookmark_content_id") REFERENCES "public"."bookmark_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "global_jobs_bookmarks" ADD CONSTRAINT "global_jobs_bookmarks_global_bookmark_id_global_bookmarks_id_fk" FOREIGN KEY ("global_bookmark_id") REFERENCES "public"."global_bookmarks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "split_content" ADD CONSTRAINT "split_content_bookmark_content_id_bookmark_content_id_fk" FOREIGN KEY ("bookmark_content_id") REFERENCES "public"."bookmark_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_bookmarks" ADD CONSTRAINT "users_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_bookmarks" ADD CONSTRAINT "users_bookmarks_global_bookmark_id_global_bookmarks_id_fk" FOREIGN KEY ("global_bookmark_id") REFERENCES "public"."global_bookmarks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vector_embedding" ADD CONSTRAINT "vector_embedding_split_content_id_split_content_id_fk" FOREIGN KEY ("split_content_id") REFERENCES "public"."split_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookmark_content_id_idx" ON "split_content" USING btree ("bookmark_content_id");--> statement-breakpoint
CREATE INDEX "idx_content_search" ON "split_content" USING gin ("content_search");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "users_bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "global_bookmark_id_idx" ON "users_bookmarks" USING btree ("global_bookmark_id");--> statement-breakpoint
CREATE INDEX "l2_index" ON "vector_embedding" USING ivfflat ("embedding" vector_l2_ops);--> statement-breakpoint
CREATE INDEX "split_content_id_idx" ON "vector_embedding" USING btree ("split_content_id");--> statement-breakpoint
CREATE INDEX "cosine_index" ON "vector_embedding" USING ivfflat ("embedding" vector_cosine_ops);