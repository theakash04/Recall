import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "./types/apiResponse";

const publicRoutes = ["/signin", "/"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublicRoute = publicRoutes.includes(pathname);

  const isAuthenticated = await axios.get<ApiResponse<undefined>>(
    `${process.env.NEXT_PUBLIC_SERVER_API}/auth/check-auth`,
    {
      withCredentials: true,
    }
  );

  if (!isPublicRoute && !isAuthenticated.data.success) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (
    isPublicRoute &&
    isAuthenticated.data.success &&
    !pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|help|bye).*)"],
};
