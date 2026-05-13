import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Next.js 16 Cache Components
  cacheComponents: true,

  // Enable React Compiler (optional but recommended)
  reactCompiler: true,

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;