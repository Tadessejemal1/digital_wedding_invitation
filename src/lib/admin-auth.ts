import { NextRequest, NextResponse } from "next/server";
import { getAdminTokenFromCookie, verifyAdminToken } from "@/lib/auth";

/** Returns 401 JSON if the request is not an authenticated admin. */
export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | null> {
  const token =
    request.cookies.get("admin_token")?.value ||
    getAdminTokenFromCookie(request.headers.get("cookie"));
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const token =
    request.cookies.get("admin_token")?.value ||
    getAdminTokenFromCookie(request.headers.get("cookie"));
  return Boolean(token && (await verifyAdminToken(token)));
}
