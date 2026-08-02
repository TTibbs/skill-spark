import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Do not treat the refresh cookie as proof of authentication here. On Vercel,
  // the Express API is reached through a rewrite, and cookie availability can
  // differ from the client auth state immediately after login. The protected
  // pages use the auth provider to refresh/validate sessions through Express,
  // and Express remains the real authorization boundary for data access.
  void request;
  return NextResponse.next();
}

export const config = {
  matcher: ["/parents/:path*", "/chores/:path*", "/rewards/:path*"],
};
