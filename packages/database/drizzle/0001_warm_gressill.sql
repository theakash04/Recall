ALTER TABLE "global_jobs_bookmarks" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "global_jobs_bookmarks" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."status";--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'scraped', 'embedded', 'completed');--> statement-breakpoint
ALTER TABLE "global_jobs_bookmarks" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."status";--> statement-breakpoint
ALTER TABLE "global_jobs_bookmarks" ALTER COLUMN "status" SET DATA TYPE "public"."status" USING "status"::"public"."status";--> statement-breakpoint
ALTER TABLE "global_jobs_bookmarks" ADD COLUMN "isFailed" boolean DEFAULT false NOT NULL;