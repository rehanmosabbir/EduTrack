import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && role !== "ADMIN" && role !== "TEACHER") {
      if (role === "STUDENT") {
        return NextResponse.redirect(new URL("/student/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (path.startsWith("/student") && role !== "STUDENT") {
      if (role === "ADMIN" || role === "TEACHER") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/admin") || path.startsWith("/student")) {
          return !!token;
        }
        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
