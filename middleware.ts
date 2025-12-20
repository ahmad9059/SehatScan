import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and NextAuth
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Protect dashboard routes
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Redirect authenticated users away from auth pages
    if (pathname === "/login" || pathname === "/register") {
      if (token) {
        const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
        const redirectUrl =
          callbackUrl && callbackUrl.startsWith("/")
            ? new URL(callbackUrl, request.url)
            : new URL("/dashboard", request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
