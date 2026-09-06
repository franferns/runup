import Link from "next/link";
import { getCatalog } from "../../lib/catalog.js";

export const metadata = {
  title: "Pair your TV",
  robots: { index: false, follow: false },
};

export default async function PairPage({ searchParams }) {
  const params = await searchParams;
  const rawCode = params?.code;
  const code =
    typeof rawCode === "string"
      ? rawCode.toUpperCase().replace(/[^A-Z0-9]/g, "")
      : null;
  const catalog = getCatalog();

  return (
    <div className="shell pair-shell">
      <header>
        <div className="brand">RUNUP</div>
        <p className="disclaimer">{catalog.disclaimer}</p>
      </header>

      <main className="pair-main">
        <h1>Pair your TV</h1>
        {code ? (
          <>
            <p>
              Enter this code on your Runup TV app to sync your catch-up session:
            </p>
            <p className="pair-code" aria-label={`Pairing code ${code}`}>
              {code.length >= 6
                ? `${code.slice(0, 3)} ${code.slice(3, 6)}`
                : code}
            </p>
          </>
        ) : (
          <p>
            Open Runup on your phone or browser, choose Watch tonight, and scan
            the QR code shown there — or enter the code from that screen on your
            TV.
          </p>
        )}
        <p>
          <Link href="/app">Open Runup</Link> to generate a pairing code from
          Tonight.
        </p>
      </main>
    </div>
  );
}
