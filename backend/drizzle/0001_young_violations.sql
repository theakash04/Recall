DROP INDEX "cosine_index";--> statement-breakpoint
CREATE INDEX "hnsw_cosine_index" ON "vector_embedding" USING hnsw ("embedding" vector_cosine_ops);