"use client";

import { getCatalog } from "../lib/catalog.js";
import { daysUntilHorizon, formatDaysLeft } from "../lib/horizon.js";
import Placement from "./Placement.jsx";

export default function Void({ state, onPlaced }) {
  const catalog = getCatalog();
  const daysLeft = daysUntilHorizon(catalog.horizon);

  return (
    <div className="shell void-shell">
      <div className="void-atmosphere" aria-hidden="true">
        <picture className="void-backdrop">
          <source
            media="(min-width: 900px)"
            srcSet="/backgrounds/void-atmosphere.jpg"
          />
          <img
            src="/backgrounds/void-atmosphere-sm.jpg"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        <div className="void-atmosphere-veil" />
        <div className="void-cosmic-shimmer" />
        <div className="void-doom-shimmer" />
        <svg className="void-strand" viewBox="0 0 1200 320" preserveAspectRatio="none">
          <path
            className="void-strand-path"
            d="M0 260 Q 280 220 520 236 T 980 180 T 1200 140"
          />
          <path
            className="void-strand-path void-strand-path-dim"
            d="M0 280 Q 320 250 600 262 T 1100 210"
          />
        </svg>
        <div className="void-stars" />
      </div>

      <header className="void-header">
        <div className="brand">RUNUP</div>
        <p className="disclaimer">{catalog.disclaimer}</p>
      </header>

      <main className="void-stage">
        <div className="void-hero">
          <p className="void-eyebrow">Cosmic front · Doom horizon</p>
          <h1>Place yourself</h1>
          <p className="void-lead">
            Two forces close in on Doomsday. Mark where you enter the Official 15
            strand.
          </p>
          <p className="void-horizon-chip">
            <span className="void-horizon-chip-value">{formatDaysLeft(daysLeft)}</span>
            <span className="void-horizon-chip-label">until {catalog.horizon}</span>
          </p>
        </div>

        <Placement currentState={state} onPlaced={onPlaced} />
      </main>

      <p className="data-note void-footer">
        Horizon {catalog.horizon} · Disney+ Official 15 track
      </p>
    </div>
  );
}
