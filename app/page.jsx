import LandingPage from "../components/LandingPage.jsx";
import { ogImage, trimSocialDescription } from "../lib/socialMeta.js";
import { getSiteUrl } from "../lib/siteUrl.js";

const siteUrl = getSiteUrl();

const pageDescription =
  "Spoiler-safe watch order and homework list for Avengers: Doomsday. Track the Disney+ Official 15 catch-up path before December 2026.";

const socialDescription = trimSocialDescription(
  "Spoiler-safe watch order for Avengers: Doomsday. Track the Disney+ Official 15 catch-up path before December 2026.",
);

export const metadata = {
  title: "Runup — spoiler-safe MCU catch-up for Avengers: Doomsday",
  description: pageDescription,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Runup — spoiler-safe MCU catch-up for Avengers: Doomsday",
    description: socialDescription,
    url: siteUrl,
    siteName: "Runup",
    images: [
      ogImage(
        "/og/runup-home.png",
        "Runup — spoiler-safe catch-up for Avengers: Doomsday",
      ),
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Runup — spoiler-safe MCU catch-up for Avengers: Doomsday",
    description: socialDescription,
    images: ["/og/runup-home.png"],
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Runup",
        url: siteUrl,
        description:
          "Unofficial spoiler-safe catch-up for Avengers: Doomsday.",
      },
      {
        "@type": "WebApplication",
        name: "Runup",
        url: siteUrl,
        applicationCategory: "EntertainmentApplication",
        operatingSystem: "Web",
        description:
          "Spoiler-safe MCU catch-up tool for the Disney+ Official 15 homework list.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
