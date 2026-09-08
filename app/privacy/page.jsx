import PrivacyPage from "../../components/PrivacyPage.jsx";
import { getPrivacyContent } from "../../lib/privacyContent.js";
import { getSiteUrl } from "../../lib/siteUrl.js";

const siteUrl = getSiteUrl();
const pageUrl = `${siteUrl}/privacy`;
const { frontmatter } = getPrivacyContent();

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
    type: "article",
  },
  twitter: {
    card: "summary",
    title: frontmatter.title,
    description: frontmatter.description,
  },
};

export default function PrivacyRoute() {
  return <PrivacyPage />;
}
