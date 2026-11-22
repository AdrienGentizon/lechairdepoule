import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cdp/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
