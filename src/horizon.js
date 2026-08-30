export const PACE_HOURS_PER_DAY = 2;

export function daysUntilHorizon(horizonIso, now = new Date()) {
  const horizon = new Date(`${horizonIso}T00:00:00`);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const diffMs = horizon.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function hoursPerDayNeeded(queueHours, daysLeft) {
  if (queueHours <= 0) {
    return 0;
  }

  if (daysLeft <= 0) {
    return queueHours;
  }

  return queueHours / daysLeft;
}

export function needsPaceWarning(
  queueHours,
  daysLeft,
  threshold = PACE_HOURS_PER_DAY,
) {
  if (queueHours <= 0) {
    return false;
  }

  return hoursPerDayNeeded(queueHours, daysLeft) > threshold;
}

export function fitToPaceBudgetHours(
  daysLeft,
  hoursPerDay = PACE_HOURS_PER_DAY,
) {
  if (daysLeft <= 0) {
    return hoursPerDay;
  }

  return daysLeft * hoursPerDay;
}

export function formatDaysLeft(daysLeft) {
  if (daysLeft < 0) {
    return "Horizon passed";
  }

  if (daysLeft === 0) {
    return "Today";
  }

  if (daysLeft === 1) {
    return "1 day left";
  }

  return `${daysLeft} days left`;
}
