// ---------------------------------------------------------------------------
// Clerk middleware: route protection + auth-route redirects.
//
// - Protected app pages require a signed-in session (redirect to /login?next=).
// - Signed-in users are bounced off the auth pages to the dashboard.
// - Public pages, the marketing site, the AI API routes, and the Clerk webhook
//   are always allowed (the AI features still work anonymously).
//
// When Clerk keys are absent we skip auth entirely so the anonymous MVP runs.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/history(.*)",
  "/phrases(.*)",
  "/templates(.*)",
  "/settings(.*)",
]);

const isAuthRoute = createRouteMatcher([
  "/login(.*)",
  "/register(.*)",
  "/forgot-password(.*)",
]);

const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

const passthrough = () => NextResponse.next();

export default isClerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      const { userId } = await auth();
      const { pathname } = req.nextUrl;

      // Signed-in users shouldn't see the auth pages.
      if (userId && isAuthRoute(req)) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        url.search = "";
        return NextResponse.redirect(url);
      }

      // Protect the app pages; send anonymous users to /login?next=…
      if (isProtectedRoute(req) && !userId) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    })
  : passthrough;

export const config = {
  matcher: [
    // Skip Next internals and static files, run on everything else + API.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    "/(api|trpc)(.*)",
  ],
};
