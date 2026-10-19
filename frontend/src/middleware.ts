import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

function homeForRole(role?: string) {
  if (role === "TEACHER") return "/teacher/dashboard";
  if (role === "GUARDIAN") return "/guardian/dashboard";
  return "/student/dashboard";
}

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/teacher") && role !== "TEACHER") {
      return NextResponse.redirect(new URL(homeForRole(role), req.url));
    }
    if (path.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL(homeForRole(role), req.url));
    }
    if (path.startsWith("/guardian") && role !== "GUARDIAN") {
      return NextResponse.redirect(new URL(homeForRole(role), req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (
          path.startsWith("/teacher") ||
          path.startsWith("/student") ||
          path.startsWith("/guardian")
        ) {
          return !!token;
        }
        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/teacher/:path*", "/student/:path*", "/guardian/:path*"],
};
