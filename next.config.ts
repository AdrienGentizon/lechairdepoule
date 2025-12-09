import type { NextConfig } from "next";

import env from "./lib/env";

const flaggedRedirections = [
  {
    enabled: !(process.env["NEXT_PUBLIC_SHOW_STORE"] === "true"),
    redirection: {
      source: "/drugstore",
      destination: "/",
      permanent: true,
    },
  },
];

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
    return flaggedRedirections.reduce(
      (
        acc: {
          source: string;
          destination: string;
          permanent: boolean;
        }[],
        curr
      ) => {
        if (!curr.enabled) return acc;
        return [...acc, curr.redirection];
      },
      []
    );
  },
};

export default nextConfig;
