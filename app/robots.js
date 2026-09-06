const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://runup.app";

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
