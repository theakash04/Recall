import { NextFunction, Request, Response } from "express";
import supabase from "../supabase/supabaseClient";
import { CreateErrorResponse } from "../utils/ResponseHandler";
import { ErrorCodes } from "../types/constant";
import { clearAuthCookies, setAuthCookies } from "../utils/cookieHandler";

const guardApi = async (req: Request, res: Response, next: NextFunction) => {
  let access_token: string = req.cookies?.sb_token;
  let refresh_token: string = req.cookies?.sb_refresh;

  if (!access_token && !refresh_token) {
    res
      .status(401)
      .json(CreateErrorResponse(ErrorCodes.NO_TOKEN, "No token provided!"));
    return;
  }

  if (!access_token && refresh_token) {
    const { data: refreshData, error: refreshError } =
      await supabase.auth.setSession({
        refresh_token,
        access_token: "", // empty access token
      });

    if (refreshError || !refreshData.session) {
      clearAuthCookies(res);
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

    access_token = refreshData.session.access_token;
    refresh_token = refreshData.session.refresh_token;

    setAuthCookies(
      res,
      access_token,
      refresh_token,
      refreshData.session.expires_in
    );
  }

  let { data: userData, error } = await supabase.auth.getUser(access_token);
  if (error) {
    if (!refresh_token) {
      clearAuthCookies(res);
      res
        .status(401)
        .json(
          CreateErrorResponse(
            ErrorCodes.AUTH_FAILED,
            "Invalid access token",
            error?.message
          )
        );
      return;
    }

    const { data: refreshData, error: refreshError } =
      await supabase.auth.setSession({
        refresh_token,
        access_token,
      });
    if (refreshError || !refreshData.session) {
      clearAuthCookies(res);
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

    access_token = refreshData.session?.access_token;
    refresh_token = refreshData.session?.refresh_token;

    setAuthCookies(
      res,
      access_token,
      refresh_token,
      refreshData.session.expires_in
    );

    const result = await supabase.auth.getUser(access_token);

    if (result.error || !result.data.user) {
      clearAuthCookies(res);
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
    clearAuthCookies(res);
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
