import type { NextConfig } from "next";
import env from "./lib/env";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
        pathname: `/${env().CONTENTFUL_SPACE_ID}/**`,
      },
    ],
  },
};

export default nextConfig;
