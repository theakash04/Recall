import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/signin", "/"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);
  let isAuthenticated = false;

  const cookies = req.headers.get("cookie");

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_API}/auth/get-user`,
      {
        headers: {
          cookie: cookies || "",
        },
        withCredentials: true,
      }
    );
    isAuthenticated = res.status < 300;
  } catch {
    isAuthenticated = false;
  }

  if (!isPublicRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/signin", req.nextUrl));
  }

  if (
    isPublicRoute &&
    isAuthenticated &&
    !req.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
