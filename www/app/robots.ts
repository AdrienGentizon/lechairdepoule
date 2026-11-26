import type { MetadataRoute } from "next";

const SITE_URL = "https://www.lechairdepoule.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/profile", "/forum/admin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
