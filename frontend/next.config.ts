import type { NextConfig } from "next";
import path from "node:path";

const backendOrigin = (
  process.env.BACKEND_ORIGIN ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080"
).replace(/\/+$/, "");

const backendApiRoutes = [
  "/auth/:path*",
  "/maps/:path*",
  "/restaurants/:path*",
  "/campaigns",
  "/ads/:path*",
  "/blogs/:path*",
  "/menu-items/:path*",
  "/user-profile/:path*",
  "/user/feed",
  "/user/posts/:path*",
  "/user/home/:path*",
  "/user/notifications",
  "/user/reviewers/:path*",
  "/owner/restaurant",
  "/owner/restaurant/:path*",
  "/owner/restaurants/:restaurantId/tables/:path*",
  "/owner/restaurants/:restaurantId/reservations/:path*",
  "/owner/restaurants/:restaurantId/menus/:path*",
  "/owner/restaurants/:restaurantId/dashboard",
  "/owner/restaurants/:restaurantId/analytics/:path*",
  "/owner/restaurants/:restaurantId/verification/:path*",
  "/owner/promotions",
  "/owner/promotions/:path*",
  "/owner/campaigns",
  "/owner/ads/:path*",
  "/owner/verification/:path*",
  "/admin/users/:path*",
  "/admin/promotions/:path*",
  "/admin/verification/:path*",
  "/admin/restaurants/:restaurantId/detail",
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return {
      afterFiles: [
        { source: "/health", destination: `${backendOrigin}/health` },
        { source: "/db-health", destination: `${backendOrigin}/db-health` },
        ...backendApiRoutes.map((route) => ({
          source: route,
          destination: `${backendOrigin}${route}`,
        })),
      ],
    };
  },
};

export default nextConfig;
