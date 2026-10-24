import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { verifyAdminToken } from "./lib/auth";

const intlMiddleware = createMiddleware(routing);

async function adminOk(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_token")?.value;
  return Boolean(token && (await verifyAdminToken(token)));
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin pages (login stays at /admin)
  if (pathname.startsWith("/admin/") && pathname !== "/admin/") {
    if (!(await adminOk(request))) {
      const login = request.nextUrl.clone();
      login.pathname = "/admin";
      login.search = "";
      return NextResponse.redirect(login);
    }
  }

  // Protect admin APIs (except login)
  if (pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/admin/login")) {
    if (!(await adminOk(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Guest list / mint / check-in — admin only
  if (
    pathname === "/api/guests" ||
    pathname === "/api/guests/bulk" ||
    pathname === "/api/checkin"
  ) {
    if (!(await adminOk(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Full photo gallery list — admin only (public status stays open without ?photos=1)
  if (
    pathname === "/api/guest-photos" &&
    request.method === "GET" &&
    request.nextUrl.searchParams.get("photos") === "1"
  ) {
    if (!(await adminOk(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Photo delete / download — admin only
  if (
    pathname.startsWith("/api/guest-photos/") &&
    (request.method === "DELETE" || pathname.endsWith("/download"))
  ) {
    if (!(await adminOk(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // i18n only for public wedding routes (not admin/api/invite)
  if (
    pathname === "/" ||
    pathname.startsWith("/am") ||
    pathname.startsWith("/en") ||
    (!pathname.startsWith("/api") &&
      !pathname.startsWith("/admin") &&
      !pathname.startsWith("/invite") &&
      !pathname.startsWith("/_next") &&
      !pathname.startsWith("/_vercel") &&
      !pathname.includes("."))
  ) {
    return intlMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/(am|en)/:path*",
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/guests",
    "/api/guests/bulk",
    "/api/checkin",
    "/api/guest-photos",
    "/api/guest-photos/:path*",
    "/((?!api|admin|invite|_next|_vercel|.*\\..*).*)",
  ],
};
