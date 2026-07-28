import { NextResponse, type NextRequest } from "next/server";

const refreshCookieName = "skill_spark_refresh_token";

export function proxy(request: NextRequest) {
  // This is only a navigation hint for the parent dashboard. The refresh cookie
  // is httpOnly and unsigned from Next.js' point of view, so its presence is not
  // proof of authentication. The client auth provider must still validate the
  // session through the Express API, and Express ownership checks remain the
  // actual security boundary.
  if (!request.cookies.has(refreshCookieName)) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/parents/:path*", "/chores/:path*", "/rewards/:path*"],
};
