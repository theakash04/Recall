import { NextFunction, Request, Response } from "express";
import supabase from "../supabase/supabaseClient";
import { CreateErrorResponse } from "../utils/ResponseHandler";
import { ErrorCodes } from "../types/constant";

const guardApi = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json(CreateErrorResponse(ErrorCodes.NO_TOKEN, "No token provided!"));
    return;
  }

  const token = authHeader.slice(7);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    res
      .status(401)
      .json(
        CreateErrorResponse(
          ErrorCodes.AUTH_FAILED,
          "Invalid or expired Access Token",
          error?.message
        )
      );
  }

  (req as any).user = {
    id: user!.id,
    ...user!.user_metadata,
    email: user!.email,
  };

  next();
};

export default guardApi;
