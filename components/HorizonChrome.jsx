"use client";

import {
  daysUntilHorizon,
  fitToPaceBudgetHours,
  formatDaysLeft,
  hoursPerDayNeeded,
  needsPaceWarning,
  PACE_HOURS_PER_DAY,
} from "../lib/horizon.js";

export default function HorizonChrome({
  horizon,
  queueHours,
  onFitToPace,
}) {
  const daysLeft = daysUntilHorizon(horizon);
  const behindPace = needsPaceWarning(queueHours, daysLeft);
  const dailyHours = hoursPerDayNeeded(queueHours, daysLeft);

  const handleFitToPace = () => {
    onFitToPace(fitToPaceBudgetHours(daysLeft));
  };

  return (
    <footer className="horizon-chrome" aria-live="polite">
      <div className="horizon-stats">
        <p className="horizon-stat">
          <span className="horizon-stat-value">~{queueHours}h</span>
          <span className="horizon-stat-label">in queue</span>
        </p>
        <p className="horizon-stat">
          <span className="horizon-stat-value">{formatDaysLeft(daysLeft)}</span>
          <span className="horizon-stat-label">to Doomsday · {horizon}</span>
        </p>
      </div>

      {behindPace && (
        <div className="pace-warning" role="status">
          <p>
            At ~{dailyHours.toFixed(1)}h per day, this path is heavier than a
            steady ~{PACE_HOURS_PER_DAY}h/day pace.
          </p>
          <button type="button" className="pace-action" onClick={handleFitToPace}>
            Fit to pace
          </button>
        </div>
      )}
    </footer>
  );
}
