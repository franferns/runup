import LandingPage from "../components/LandingPage.jsx";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://runup.app";

export const metadata = {
  title: "Runup — spoiler-safe MCU catch-up for Avengers: Doomsday",
  description:
    "Spoiler-safe watch order and homework list for Avengers: Doomsday. Track the Disney+ Official 15 catch-up path before December 2026.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Runup — spoiler-safe MCU catch-up for Avengers: Doomsday",
    description:
      "Spoiler-safe watch order and homework list for Avengers: Doomsday. Track the Disney+ Official 15 catch-up path before December 2026.",
    url: siteUrl,
    siteName: "Runup",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512 }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Runup — spoiler-safe MCU catch-up for Avengers: Doomsday",
    description:
      "Spoiler-safe watch order and homework list for Avengers: Doomsday. Track the Disney+ Official 15 catch-up path before December 2026.",
    images: ["/icons/icon-512.png"],
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
