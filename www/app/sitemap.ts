import type { MetadataRoute } from "next";

const SITE_URL = "https://www.lechairdepoule.fr";

const PUBLIC_PATHS = ["/", "/contact", "/agenda", "/forum", "/forum/cgu"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` }));
}
