"use client";

import Link from "next/link";
import HorizonChrome from "./HorizonChrome.jsx";
import { prefersReducedMotion } from "../lib/motion.js";
import { buildQueueModel } from "../lib/queueModel.js";
import { ENABLE_POSTERS } from "../lib/posters.js";
import { downloadShareStill } from "../lib/shareStill.js";
import { applyFitToPace, markAlreadySeen, markSkipped } from "../lib/storage.js";
import Threadfield from "./Threadfield.jsx";
import TonightCard from "./TonightCard.jsx";
import VoidAtmosphere from "./VoidAtmosphere.jsx";
import { usePageTitle } from "./usePageTitle.js";
import { useCallback, useState } from "react";

export default function ThreadfieldView({
  state,
  onChangePlacement,
  onResetProgress,
  resetDisabled = false,
  onStateChange,
  onOpenList,
  reduceMotion = false,
}) {
  const model = buildQueueModel(state);
  const [isDrawing, setIsDrawing] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const motionReduced = reduceMotion || prefersReducedMotion();

  usePageTitle(model?.tonight ? model.tonight.title : "Threadfield");

  if (!model) {
    return null;
  }

  const { catalog, persona, queue, strandQueue, tonight, hours, budgetNote } = model;

  const completeAlreadySeen = useCallback(() => {
    if (!tonight) {
      return;
    }

    onStateChange(markAlreadySeen(state, tonight.id));
  }, [onStateChange, state, tonight]);

  const handleAlreadySeen = () => {
    if (!tonight || isDrawing || completingId) {
      return;
    }

    setCompletingId(tonight.id);

    if (motionReduced) {
      window.setTimeout(() => {
        completeAlreadySeen();
        setCompletingId(null);
      }, 450);
      return;
    }

    setIsDrawing(true);
  };

  const handleDrawComplete = useCallback(() => {
    setIsDrawing(false);
    completeAlreadySeen();
    setCompletingId(null);
  }, [completeAlreadySeen]);

  const handleSkip = () => {
    if (!tonight || isDrawing || completingId) {
      return;
    }

    onStateChange(markSkipped(state, tonight.id));
  };

  const handleFitToPace = (budgetHours) => {
    onStateChange(applyFitToPace(state, budgetHours));
  };

  const handleShareStill = async () => {
    if (isSharing || isDrawing || completingId) {
      return;
    }

    setIsSharing(true);
    try {
      await downloadShareStill(model);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="shell threadfield-shell">
      <VoidAtmosphere />

      <header className="list-header">
        <div>
          <div className="brand">RUNUP</div>
          <p className="disclaimer">{catalog.disclaimer}</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="text-button"
            onClick={handleShareStill}
            disabled={isSharing || isDrawing}
          >
            {isSharing ? "Saving…" : "Share still"}
          </button>
          <button type="button" className="text-button" onClick={onOpenList}>
            List view
          </button>
          <Link href="/" className="text-button">
            Home
          </Link>
          <Link href="/pair" className="text-button">
            Pair TV
          </Link>
          <button type="button" className="text-button" onClick={onChangePlacement}>
            Change placement
          </button>
          <button
            type="button"
            className="text-button"
            onClick={onResetProgress}
            disabled={resetDisabled}
          >
            Reset progress
          </button>
        </div>
      </header>

      <Threadfield
        strandQueue={strandQueue}
        isDrawing={isDrawing}
        completingId={completingId}
        onDrawComplete={handleDrawComplete}
        reduceMotion={motionReduced}
      />

      <div className="threadfield-tonight">
        <TonightCard
          key={tonight?.id ?? "empty"}
          title={tonight}
          onAlreadySeen={handleAlreadySeen}
          onSkip={handleSkip}
          actionsDisabled={isDrawing || Boolean(completingId)}
        />
        <p className="list-meta threadfield-meta">
          {persona.label}
          {budgetNote} · {queue.length} titles
          {ENABLE_POSTERS && (
            <span className="tmdb-attr"> · Posters via TMDB</span>
          )}
        </p>
      </div>

      <HorizonChrome
        horizon={catalog.horizon}
        queueHours={hours}
        onFitToPace={handleFitToPace}
      />
    </div>
  );
}
