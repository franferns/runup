import Official15Page from "../../components/Official15Page.jsx";
import { getOrderedTitles } from "../../lib/catalog.js";
import { getOfficial15Content } from "../../lib/official15Content.js";
import { getSiteUrl } from "../../lib/siteUrl.js";

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/official-15`;

const { frontmatter } = getOfficial15Content();

export const metadata = {
  title: frontmatter.title,
  description: frontmatter.description,
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: frontmatter.title,
    description: frontmatter.description,
    url: pageUrl,
    siteName: "Runup",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512 }],
    type: "article",
  },
  twitter: {
    card: "summary",
    title: frontmatter.title,
    description: frontmatter.description,
    images: ["/icons/icon-512.png"],
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
