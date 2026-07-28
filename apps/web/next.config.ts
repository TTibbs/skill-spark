import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || "http://localhost:8181";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.136"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
