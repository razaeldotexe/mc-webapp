import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Allow serving uploaded files
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
