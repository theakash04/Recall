import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/signin", "/", "/signin/callback"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublicRoute = publicRoutes.includes(pathname);
  const token =
    req.cookies.get("sb_token")?.value || req.cookies.get("sb_refresh")?.value;

  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (isPublicRoute && token && !pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|help|bye).*)"],
};
