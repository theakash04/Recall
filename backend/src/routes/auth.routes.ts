import { Request, Response, Router } from "express";
import supabase from "../supabase/supabaseClient";
import guardApi from "../middlewares/gaurd";
import { user } from "../types/userTypes";
import {
  CreateSuccessResponse,
  CreateErrorResponse,
} from "../utils/ResponseHandler";
import { desc, gt } from "drizzle-orm";
import { ErrorCodes } from "../types/constant";
import { db } from "../database/dbConnect";
import { userFeedback } from "../database/schema";
import { userFeedbackSchema } from "../types/zod/users";
import { feedbacks } from "../types/dbTypes";

const router: Router = Router();

// delete user account
router.get("/delete-account", guardApi, async (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      throw new Error("Error while deleting user Account!");
    }

    res.status(200).json(CreateSuccessResponse("User deleted Successfully!"));
  } catch (err) {
    res
      .status(500)
      .json(
        CreateErrorResponse(
          ErrorCodes.SERVER_ERROR,
          "Something unexpected Happened!",
          err instanceof Error ? err.message : undefined
        )
      );
  }
});

// add feedback
router.post("/add-feedback", guardApi, async (req: Request, res: Response) => {
  const user = (req as any).user;

  const result = userFeedbackSchema.safeParse(req.body);
  if (!result.success) {
    res
      .status(400)
      .json(
        CreateErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          "Request body validation failed!",
          JSON.stringify(result.error.format())
        )
      );
    return;
  }

  try {
    const { rating, feedback } = result.data;
    await db.insert(userFeedback).values({
      rating: rating,
      userId: user.id,
      feedback: feedback,
    });

    res.status(200).json(CreateSuccessResponse("Feedback sent successfully!"));
  } catch (err) {
    res
      .status(500)
      .json(
        CreateErrorResponse(
          ErrorCodes.SERVER_ERROR,
          "Something unexpected Happened!",
          err instanceof Error ? err.message : undefined
        )
      );
  }
});

// route to get feedback from the user and show it on home screen
router.get("/get-feedbacks", async (req: Request, res: Response) => {
  try {
    let feedbacks = await db
      .select({
        id: userFeedback.id,
        rating: userFeedback.rating,
        feedback: userFeedback.feedback,
        userId: userFeedback.userId,
      })
      .from(userFeedback)
      .where(gt(userFeedback.rating, 4))
      .limit(10)
      .orderBy(desc(userFeedback.rating))
      .then(async (feedbacks) => {
        const uniqueFeedbacksMap = new Map();
        feedbacks.forEach((fb) => {
          if (!uniqueFeedbacksMap.has(fb.userId)) {
            uniqueFeedbacksMap.set(fb.userId, fb);
          }
        });

        const uniqueFeedbacks: feedbacks[] = Array.from(
          uniqueFeedbacksMap.values()
        );

        // unique id's
        const userIds = uniqueFeedbacks.map((fb) => fb.userId);

        const userDetailsPromise = userIds.map((id) =>
          supabase.auth.admin.getUserById(id)
        );

        const userDetailsResults = await Promise.all(userDetailsPromise);

        // map user id with userDetails
        const userDetailsMap = new Map();
        userDetailsResults.forEach((result, index) => {
          userDetailsMap.set(userIds[index], {
            avatar_url: result.data.user?.user_metadata?.avatar_url,
            name: result.data.user?.user_metadata?.full_name,
          });
        });

        const feedbacksWithUserDetails = uniqueFeedbacks.map((fb) => ({
          ...fb,
          user: userDetailsMap.get(fb.userId) || null,
        }));

        return feedbacksWithUserDetails;
      });

    if (feedbacks && feedbacks?.length < 5) {
      feedbacks = [];
    }

    res
      .status(200)
      .json(
        CreateSuccessResponse(feedbacks, "Feedbacks retrieved successfully!")
      );
  } catch (err) {
    res
      .status(500)
      .json(
        CreateErrorResponse(
          ErrorCodes.SERVER_ERROR,
          "Something unexpected Happened!",
          err instanceof Error ? err.message : undefined
        )
      );
  }
});

export default router;
