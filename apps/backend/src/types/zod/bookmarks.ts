import { z } from "zod";

export const getQuerySchema = z
  .object({
    url: z
      .string()
      .url()
      .regex(/^https:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/)
      .optional(),
    string: z.string().min(5).optional(),
  })
  .refine((data) => data.url || data.string, {
    message: "Either 'url' or 'string' must be provided.",
  })
  .refine((data) => !(data.url && data.string), {
    message: "Provide only one of 'url' or 'string', not both.",
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
