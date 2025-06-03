import { z } from "zod";

// input bookmark 
export const inputBookmarkSchema = z.object({
  url: z
    .string()
    .url("please enter a valid URL")
    .min(1, "url is required")
});

export type BookmarkFormData = z.infer<typeof inputBookmarkSchema>
