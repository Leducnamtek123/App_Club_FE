// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Kiểm tra nếu đường dẫn là "/"
  if (request.nextUrl.pathname === "/") {
    // Chuyển hướng đến "/login"
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // Nếu không phải "/", tiếp tục xử lý bình thường
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
