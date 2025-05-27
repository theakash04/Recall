ALTER TABLE "vector_embedding" ALTER COLUMN "embedding" SET DATA TYPE vector(768);--> statement-breakpoint
ALTER TABLE "bookmark_content" ADD COLUMN "content_hash" varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE "bookmark_content" ADD CONSTRAINT "bookmark_content_content_hash_unique" UNIQUE("content_hash");