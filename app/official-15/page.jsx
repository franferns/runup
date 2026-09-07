import Official15Page from "../../components/Official15Page.jsx";
import { getOrderedTitles } from "../../lib/catalog.js";
import { getOfficial15Content } from "../../lib/official15Content.js";
import { ogImage, trimSocialDescription } from "../../lib/socialMeta.js";
import { getSiteUrl } from "../../lib/siteUrl.js";

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/official-15`;

const { frontmatter } = getOfficial15Content();
const socialDescription = trimSocialDescription(frontmatter.description);

export const metadata = {
  title: frontmatter.title,
  description: frontmatter.description,
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: frontmatter.title,
    description: socialDescription,
    url: pageUrl,
    siteName: "Runup",
    images: [
      ogImage(
        "/og/runup-official-15.png",
        "Official 15 MCU homework list for Avengers: Doomsday",
      ),
    ],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: frontmatter.title,
    description: socialDescription,
    images: ["/og/runup-official-15.png"],
  },
};

export default function Official15Route() {
  const titles = getOrderedTitles();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Disney+ Official 15 homework list",
    numberOfItems: titles.length,
    itemListElement: titles.map((title, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: title.title,
      description: title.spoilerSafeWhy,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Official15Page />
    </>
  );
}
