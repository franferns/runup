"use client";

import { getCatalog } from "../lib/catalog.js";
import { daysUntilHorizon, formatDaysLeft } from "../lib/horizon.js";
import Placement from "./Placement.jsx";
import VoidAtmosphere from "./VoidAtmosphere.jsx";

export default function Void({ state, onPlaced }) {
  const catalog = getCatalog();
  const daysLeft = daysUntilHorizon(catalog.horizon);

  return (
    <div className="shell void-shell">
      <VoidAtmosphere />

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
