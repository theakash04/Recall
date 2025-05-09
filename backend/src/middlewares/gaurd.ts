import { NextFunction, Request, Response } from "express";
import supabase from "../utils/supabaseClient";

const guardApi = async (req: Request, res: Response, next: NextFunction) => {
  let access_token: string = req.cookies?.sb_token;
  const refresh_token: string = req.cookies?.sb_refresh;

  let { data: userData, error } = await supabase.auth.getUser(access_token);

  if (error && refresh_token) {
    const { data: refreshData, error: refreshError } = await supabase.auth.setSession({
      refresh_token, access_token
    })

    if (refreshError || !refreshData.session) {
      res.status(401).json({
        status: 401,
        message: "unable to refresh Token",
        error: refreshError
      })
    }
    const newAccessToken = refreshData.session?.access_token;
    const expiresIn = refreshData.session?.expires_in;


    res.cookie("sb_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "prod",
      sameSite: "lax",
      maxAge: expiresIn ? expiresIn * 1000 : 15 * 60 * 1000,
    })

    access_token = newAccessToken || '';
    const result = await supabase.auth.getUser(access_token);

    if (result.error || !result.data.user) {
      res.status(401).json({
        status: 401,
        message: "Authentication Failed!"
      })
    }

    userData = result.data;
  }

  if (!userData?.user?.user_metadata) {
    res.status(401).json({
      status: 401,
      message: "Not Authenticated!"
    })
  }

  // Attatch user to request for downstream handler
  (req as any).user = userData.user?.user_metadata;
  next();
}

export default guardApi;



