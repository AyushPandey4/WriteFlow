// middleware.js
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { publicRoutes, protectedRoutes } from "./publicRoutes";

const isProtectedRoute = createRouteMatcher(protectedRoutes);

export default clerkMiddleware((auth, req) => {
  if (
    publicRoutes.some((route) => req.nextUrl.pathname.match(new RegExp(route)))
  ) {
    return;
  }

  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
