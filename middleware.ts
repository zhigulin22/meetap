import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/supabase/middleware";

const protectedRoutes = ["/feed", "/events", "/contacts", "/profile"];

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (!isProtected) {
    return response;
  }

  const userId = request.cookies.get("meetap_user_id")?.value;
  const verified = request.cookies.get("meetap_verified")?.value;

  if (!userId || verified !== "1") {
    const url = request.nextUrl.clone();
    url.pathname = "/register";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
