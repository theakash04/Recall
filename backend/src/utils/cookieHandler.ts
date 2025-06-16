import { Response } from "express";

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("sb_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    domain: ".akashtwt.me",
    sameSite: "lax",
  });
  res.clearCookie("sb_refresh", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    domain: ".akashtwt.me",
    sameSite: "lax",
  });
};

export const setAuthCookies = (
  res: Response,
  access_token: string,
  refresh_token: string,
  expires_in: number
) => {
  res.cookie("sb_token", access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    domain: ".akashtwt.me",
    path: "/",
    maxAge: expires_in ? expires_in * 1000 : 15 * 60 * 1000,
  });

  res.cookie("sb_refresh", refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    domain: ".akashtwt.me",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
