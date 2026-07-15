import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Prisma reads the seeded SQLite snapshot at runtime. Next's file tracer
  // cannot infer this env-based path, so include it in every server function
  // (Vercel otherwise deploys the API without the database file).
  outputFileTracingIncludes: {
    "/*": ["./db/custom.db"],
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
