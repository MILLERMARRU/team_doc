import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitir imágenes desde GitHub (por si se usan en el markdown)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
    ],
  },
  // Deshabilitar el header X-Powered-By
  poweredByHeader: false,
};

export default nextConfig;
