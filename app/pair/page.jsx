import Link from "next/link";
import TvPairingPanel from "../../components/TvPairingPanel.jsx";
import VoidAtmosphere from "../../components/VoidAtmosphere.jsx";
import { getCatalog } from "../../lib/catalog.js";

export const metadata = {
  title: "Pair your TV",
  robots: { index: false, follow: false },
};

function normalizePairCode(rawCode) {
  if (typeof rawCode !== "string") {
    return null;
  }

  const digits = rawCode.replace(/\D/g, "").slice(0, 6);
  return digits.length === 6 ? digits : null;
}

export default async function PairPage({ searchParams }) {
  const params = await searchParams;
  const urlCode = normalizePairCode(params?.code);
  const catalog = getCatalog();

  return (
    <div className="shell pair-shell">
      <VoidAtmosphere />

      <header>
        <div className="brand">RUNUP</div>
        <p className="disclaimer">{catalog.disclaimer}</p>
      </header>

      <main className="pair-main">
        <h1>Pair your TV</h1>

        {urlCode ? (
          <>
            <p>
              Enter this code on your Runup TV app to sync your catch-up session
              for Tonight.
            </p>
            <div className="tonight-pairing-code-block">
              <p className="tonight-pairing-code" aria-label={`Pairing code ${urlCode}`}>
                {urlCode.slice(0, 3)} {urlCode.slice(3)}
              </p>
            </div>
          </>
        ) : (
          <>
            <p>
              Open the Runup app on your Android TV, enter the code below, and
              your queue will sync for Tonight.
            </p>
            <TvPairingPanel standalone />
          </>
        )}

        <p className="pair-back">
          <Link href="/">Back to home</Link>
        </p>
      </main>
    </div>
  );
}
