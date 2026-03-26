import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Applicant-facing runner routes (must be public)
  "/forms(.*)",
  // Public Q&A API used by runner (must be public)
  "/api/forms/public(.*)",
  // Health check
  "/api/forms/health(.*)",
]);

const proxy = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const authResult = await auth();
    if (!authResult.userId) {
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export default proxy;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
