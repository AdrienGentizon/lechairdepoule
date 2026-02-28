import type { NextConfig } from "next";

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
        hostname: "**.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
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
