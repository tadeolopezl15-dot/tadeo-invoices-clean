import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

// Inicializar plugin PWA
const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Opcional pero recomendado para producción
  experimental: {
    typedRoutes: true,
  },
};

// Export final con PWA activado
export default withPWA(nextConfig);