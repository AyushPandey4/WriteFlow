export const publicRoutes = [
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/about",
  "/api/webhook(.*)",
  "/blog(.*)",
  "/author(.*)",
];

export const protectedRoutes = [
  "/dashboard(.*)",
  "/api/comments(.*)",
  "/api/likes(.*)",
  "/api/bookmarks",
];
