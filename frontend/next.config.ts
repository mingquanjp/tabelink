import type { NextConfig } from "next";
import path from "node:path";

const backendOrigin = (
  process.env.BACKEND_ORIGIN ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080"
).replace(/\/+$/, "");

const backendApiPrefixes = [
  "auth",
  "admin",
  "owner",
  "user",
  "user-profile",
  "restaurants",
  "maps",
  "campaigns",
  "ads",
  "blogs",
  "menu-items",
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
        ...backendApiPrefixes.flatMap((prefix) => [
          {
            source: `/${prefix}`,
            destination: `${backendOrigin}/${prefix}`,
          },
          {
            source: `/${prefix}/:path*`,
            destination: `${backendOrigin}/${prefix}/:path*`,
          },
        ]),
      ],
    };
  },
};

export default nextConfig;
