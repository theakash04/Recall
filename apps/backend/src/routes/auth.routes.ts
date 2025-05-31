import { Request, Response, Router } from "express";
import supabase from "../supabase/supabaseClient";
import guardApi from "../middlewares/gaurd";
import { user } from "../types/userTypes";
import { ErrorCodes } from "@repo/utils/sharedTypes";
import {
  CreateSuccessResponse,
  CreateErrorResponse,
} from "../utils/ResponseHandler";
import { db } from "@repo/database/database";
import { usersBookmarks } from "@repo/database/schema";
import { eq } from "drizzle-orm";

const router: Router = Router();

// login route oAuth google
router.get("/login", async (_req: Request, res: Response) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:8000/api/auth/callback",
    },
  });

  if (error) {
    res.status(500).json({
      status: 500,
      message: "Something unexpected happened!",
    });
    return;
  }
  res.redirect(data.url);
});

// callback route for handling the token
router.get("/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) {
    res
      .status(400)
      .json(
        CreateErrorResponse(
          ErrorCodes.NO_TOKEN,
          "no token provided from google auth"
        )
      );
    return;
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    res
      .status(500)
      .json(
        CreateErrorResponse(ErrorCodes.SERVER_ERROR, "Something went Wrong")
      );
    return;
  }

  const { session } = data;

  res.cookie("sb_token", session?.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session?.expires_in ? session?.expires_in * 1000 : 15 * 60 * 1000,
  });
  res.cookie("sb_refresh", session?.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect("http://localhost:3000/dashboard");
});

// protected route with middleware to fetch user data
router.get("/get-user", guardApi, async (req: Request, res: Response) => {
  const user = (req as any).user as user;

  const { avatar_url, email, email_verified, full_name } = user;

  const selectedUserMetadata = {
    avatar_url,
    email,
    email_verified,
    full_name,
  };

  res.json(CreateSuccessResponse(selectedUserMetadata, "User Found"));
});

// logout handling
router.get("/logout", guardApi, async (req: Request, res: Response) => {
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) {
    res
      .status(500)
      .json(
        CreateErrorResponse(
          ErrorCodes.SERVER_ERROR,
          "Something unexpected happened!",
          error.message
        )
      );
    return;
  }

  res.clearCookie("sb_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.clearCookie("sb_refresh", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json(CreateSuccessResponse("Logout successfully!"));
});

// delete user account
router.get("/delete-account", guardApi, async (req: Request, res: Response) => {
  const user = req as any;
  try {
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      throw new Error("Error while deleting user Account!");
    }

    const userDataDeleted = await db
      .delete(usersBookmarks)
      .where(eq(usersBookmarks.userId, user.id))
      .returning()
      .then((row) => {
        const user = row[0];
        if (user) return true;
        return false;
      });

    if (!userDataDeleted) {
      throw new Error("Error while deleting user Bookmarks!");
    }

    res
      .status(200)
      .json(
        CreateSuccessResponse(
          { userDeleted: userDataDeleted },
          "User deleted Successfully!"
        )
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
