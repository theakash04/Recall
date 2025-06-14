import { Response } from "express";

export const clearAuthCookies = (res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("sb_token", {
    httpOnly: true,
    secure: isProd,
    path: "/",
    sameSite: "none",
  });
  res.clearCookie("sb_refresh", {
    httpOnly: true,
    secure: isProd,
    path: "/",
    sameSite: "none",
  });
};

export const setAuthCookies = (
  res: Response,
  access_token: string,
  refresh_token: string,
  expires_in: number
) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("sb_token", access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "none",
    path: "/",
    maxAge: expires_in ? expires_in * 1000 : 15 * 60 * 1000,
  });

  res.cookie("sb_refresh", refresh_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });
};
