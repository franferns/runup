import { getSiteUrl } from "../lib/siteUrl.js";

const siteUrl = getSiteUrl();

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/design", "/pair"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
