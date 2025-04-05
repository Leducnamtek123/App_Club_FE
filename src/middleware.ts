// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


const adminRestrictedRoutes = ["/management/branch-leader","/management/introduction"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (adminRestrictedRoutes.includes(pathname)) {
    const userRole = request.cookies.get("role")?.value;
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/","/management/branch-leader","/management/introduction"],
};
