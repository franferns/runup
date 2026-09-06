import Link from "next/link";
import { getCatalog } from "../lib/catalog.js";
import { daysUntilHorizon, formatDaysLeft } from "../lib/horizon.js";

export default function LandingPage() {
  const catalog = getCatalog();
  const daysLeft = daysUntilHorizon(catalog.horizon);

  return (
    <div className="shell landing-shell">
      <header className="landing-header">
        <div className="brand">RUNUP</div>
        <p className="disclaimer">{catalog.disclaimer}</p>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <p className="landing-eyebrow">Spoiler-safe MCU catch-up</p>
          <h1>Find your path to Avengers: Doomsday</h1>
          <p>
            Runup helps you catch up on the Disney+ Official 15 homework list
            before the December 2026 horizon — without plot spoilers. Place
            yourself on the strand, see what to watch tonight, and track your
            remaining queue.
          </p>
          <p>
            Choose a starting lane that matches what you have already seen, from
            post-Endgame through the full Official 15 list or an eight-hour
            budget trim. The threadfield shows your remaining titles in watch
            order with spoiler-safe blurbs only.
          </p>
          <p className="landing-horizon">
            {formatDaysLeft(daysLeft)} until {catalog.horizon}
          </p>

          <div className="landing-ctas">
            <Link href="/app" className="landing-cta landing-cta-primary">
              Start your path
            </Link>
            <Link href="/official-15" className="landing-cta">
              See the Official 15 list
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p className="data-note">
          Horizon {catalog.horizon} · Disney+ Official 15 track
        </p>
      </footer>
    </div>
  );
}
