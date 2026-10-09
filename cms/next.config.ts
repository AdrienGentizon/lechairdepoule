import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cdp/lib", "@cdp/ui"],
};

export default nextConfig;
