import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Do NOT run i18n on /admin, /api, /invite — those live outside [locale]
  matcher: [
    "/",
    "/(am|en)/:path*",
    "/((?!api|admin|invite|_next|_vercel|.*\\..*).*)",
  ],
};
