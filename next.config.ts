import type { NextConfig } from "next";
import env from "./lib/env";
import isDevPlatform from "./lib/isDevPlatform";

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
  async redirects() {
    return isDevPlatform()
      ? []
      : [
          {
            source: "/drugstore",
            destination: "/",
            permanent: true,
          },
          {
            source: "/contact",
            destination: "/",
            permanent: true,
          },
        ];
  },
};

export default nextConfig;
