import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: "dist",
  productionBrowserSourceMaps: true,
  images: {
    domains: ["cdn.pji.nu"],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/category",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
