"use client";

import HorizonChrome from "./HorizonChrome.jsx";
import { buildQueueModel } from "../lib/queueModel.js";
import { applyFitToPace, markAlreadySeen, markSkipped } from "../lib/storage.js";
import RemainingQueueList from "./RemainingQueueList.jsx";
import TonightCard from "./TonightCard.jsx";
import VoidAtmosphere from "./VoidAtmosphere.jsx";
import { usePageTitle } from "./usePageTitle.js";

export default function ListView({
  state,
  onChangePlacement,
  onStateChange,
  onOpenThreadfield,
}) {
  const model = buildQueueModel(state);

  usePageTitle(model?.tonight ? model.tonight.title : "Remaining queue");

  if (!model) {
    return null;
  }

  const { catalog, persona, queue, tonight, hours, budgetNote } = model;

  const handleAlreadySeen = () => {
    if (!tonight) {
      return;
    }
    onStateChange(markAlreadySeen(state, tonight.id));
  };

  const handleSkip = () => {
    if (!tonight) {
      return;
    }
    onStateChange(markSkipped(state, tonight.id));
  };

  const handleFitToPace = (budgetHours) => {
    onStateChange(applyFitToPace(state, budgetHours));
  };

  return (
    <div className="shell queue-shell list-fallback-shell">
      <VoidAtmosphere />

      <header className="list-header">
        <div>
          <div className="brand">RUNUP</div>
          <p className="disclaimer">{catalog.disclaimer}</p>
        </div>
        <div className="header-actions">
          {onOpenThreadfield && (
            <button type="button" className="text-button" onClick={onOpenThreadfield}>
              View strand
            </button>
          )}
          <button type="button" className="text-button" onClick={onChangePlacement}>
            Change placement
          </button>
        </div>
      </header>

      <main className="list-fallback-main">
        <section className="list-panel" aria-labelledby="queue-heading">
          <p className="list-meta">
            {persona.label}
            {budgetNote} · {queue.length} titles · ~{hours}h remaining
          </p>
          <h1 id="queue-heading" className="list-heading">
            Remaining queue
          </h1>

          <RemainingQueueList queue={queue} headingId="queue-heading" />
        </section>

        {tonight && (
          <aside className="list-tonight-aside" aria-label="Tonight actions">
            <TonightCard
              key={tonight.id}
              title={tonight}
              onAlreadySeen={handleAlreadySeen}
              onSkip={handleSkip}
            />
          </aside>
        )}
      </main>

      <HorizonChrome
        horizon={catalog.horizon}
        queueHours={hours}
        onFitToPace={handleFitToPace}
      />
    </div>
  );
}
