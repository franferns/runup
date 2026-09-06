import "../styles/globals.css";

export const metadata = {
  title: {
    default: "Runup — unofficial catch-up",
    template: "%s · Runup",
  },
  description:
    "Unofficial, spoiler-safe catch-up path for Avengers: Doomsday. Not affiliated with Marvel or Disney.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://runup.app",
  ),
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon-192.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0b0c10",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
