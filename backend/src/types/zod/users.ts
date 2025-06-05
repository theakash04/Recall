import { z } from "zod";

export const userFeedbackSchema = z.object({
  rating: z
    .number()
    .max(5, {
      message: "Rating cannot be more than 5",
    })
    .min(1, {
      message: "Rating must be at least greater or equal to 1",
    }),
  feedback: z
    .string()
    .min(12, {
      message: "Feedback must be at least 12 character long",
    })
    .max(500, {
      message: "Feedback cannot exceed 500 characters",
    })
    .optional(),
});
