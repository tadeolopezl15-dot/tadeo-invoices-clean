import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;