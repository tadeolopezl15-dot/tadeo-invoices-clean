import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,

  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;