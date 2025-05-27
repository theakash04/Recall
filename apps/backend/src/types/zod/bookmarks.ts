import { z } from "zod";

export const getQuerySchema = z
  .object({
    query: z.union([
      z
        .string()
        .url()
        .regex(/^https:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/),
      z.string(),
    ]),
    search_type: z
      .enum(["keyword", "semantic", "hybrid", "url"])
      .default("keyword"),
  })
  .superRefine((data, ctx) => {
    typeof data.query as string;

    // check if the query is a valid URL
    let isUrl = false;
    try {
      const url = new URL(data.query);
      isUrl = url.protocol === "https:";
      data.search_type = "url";
    } catch {
      isUrl = false;
    }

    const isSemanticOrHybrid =
      data.search_type === "semantic" || data.search_type === "hybrid";

    if (!isUrl && isSemanticOrHybrid && data.query.length < 10) {
      ctx.addIssue({
        path: ["query"],
        message:
          "For semantic or hybrid search, query must be at least 10 characters long.",
        code: z.ZodIssueCode.custom,
      });
    } else if (!isUrl && data.query.length < 5) {
      ctx.addIssue({
        path: ["query"],
        message: "Query must be at least 5 characters long.",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const addUrlSchema = z.object({
  url: z
    .string()
    .url()
    .regex(/^https:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/, {
      message: "Only valid HTTPS URLs are allowed",
    })
    .min(12, {
      message: "Minimum length of url should be 12",
    }),
});
