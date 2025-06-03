import { NextFunction, Request, Response } from "express";
import supabase from "../supabase/supabaseClient";
import { CreateErrorResponse } from "../utils/ResponseHandler";
import { ErrorCodes } from "../types/constant";

const guardApi = async (req: Request, res: Response, next: NextFunction) => {
  let access_token: string = req.cookies?.sb_token;
  let refresh_token: string = req.cookies?.sb_refresh;
  console.log(refresh_token);

  if (!access_token && !refresh_token) {
    res
      .status(401)
      .json(CreateErrorResponse(ErrorCodes.NO_TOKEN, "No token provided!"));
    return;
  }

  let { data: userData, error } = await supabase.auth.getUser(access_token);

  if (error && refresh_token) {
    const { data: refreshData, error: refreshError } =
      await supabase.auth.setSession({
        refresh_token,
        access_token,
      });

    if (refreshError || !refreshData.session) {
      res.clearCookie("sb_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      });
      res.clearCookie("sb_refresh", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      });
      res
        .status(401)
        .json(
          CreateErrorResponse(
            ErrorCodes.REFRESH_FAILED,
            "Unable to refresh token",
            refreshError?.message
          )
        );
      return;
    }
    const newAccessToken = refreshData.session?.access_token;
    const newRefreshToken = refreshData.session?.refresh_token;
    const expiresIn = refreshData.session.expires_in;

    res.cookie("sb_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn ? expiresIn * 1000 : 15 * 60 * 1000,
    });

    res.cookie("sb_refresh", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    access_token = newAccessToken;
    refresh_token = newRefreshToken;

    const result = await supabase.auth.getUser(access_token);

    if (result.error || !result.data.user) {
      res
        .status(401)
        .json(
          CreateErrorResponse(ErrorCodes.AUTH_FAILED, "Authentication failed!")
        );
      return;
    }

    userData = result.data;
  }

  if (!userData?.user?.user_metadata) {
    res
      .status(401)
      .json(
        CreateErrorResponse(ErrorCodes.NOT_AUTHENTICATED, "Not Authenticated!")
      );
    return;
  }

  // Attach user to request for downstream handler
  (req as any).user = {
    id: userData.user.id,
    ...userData.user?.user_metadata,
  };
  next();
};

export default guardApi;
