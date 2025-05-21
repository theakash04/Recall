import { Request, Response, Router } from "express";
import supabase from "../supabase/supabaseClient";
import guardApi from "../middlewares/gaurd";
import { user } from "../types/userTypes";

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
    res.status(400).json({
      status: 400,
      message: "No code provided",
    });
    return;
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    res.status(500).json({
      status: 500,
      message: "Something unexpected happend!",
    });
    return;
  }

  const { session, user } = data;
  console.log(user.user_metadata);

  res.cookie("sb_token", session?.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: session?.expires_in ? session?.expires_in * 1000 : 15 * 60 * 1000,
  });
  res.cookie("sb_refresh", session?.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
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

  res.json(selectedUserMetadata);
});

// logout handling
router.get("/logout", guardApi, async (req: Request, res: Response) => {
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

  res.status(200).json({
    status: 200,
    message: "Successfull logout",
  });
});

export default router;
