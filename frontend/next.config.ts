import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA will be configured here with next-pwa
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
