import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  
  // Cast wrapper as any to satisfy typescript type constraints
  const cookieStore = {
    get: (name: string) => request.cookies.get(name),
    set: (name: string, value: string, opts: any) => response.cookies.set({ name, value, ...opts }),
  } as any;

  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/signup");
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute && (!session.userId || !session.orgId)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && session.userId && session.orgId) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/signup"],
};
