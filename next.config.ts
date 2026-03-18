import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Prisma's native query engine is included in Vercel serverless output.
  // Without this, Next/Vercel file tracing can omit `node_modules/.prisma/client/*.node`,
  // leading to "Prisma Client could not locate the Query Engine" at runtime.
  outputFileTracingIncludes: {
    // Apply to all routes/functions.
    "/*": [
      "./node_modules/.prisma/client/**",
      "./node_modules/@prisma/**",
      "./node_modules/prisma/**",
    ],
  },
};

export default nextConfig;
