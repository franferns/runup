import { daysUntilHorizon, formatDaysLeft } from "./horizon.js";
import {
  BEAD_HALO_EXTRA,
  getBeadRadius,
  getThreadfieldLayout,
  strandPathFromPoints,
} from "./threadfieldLayout.js";

const VOID = "#0b0c10";
const AMBER = "#e8a54b";
const AMBER_DIM = "rgba(232, 165, 75, 0.42)";
const TEXT = "#f4f1ea";
const MUTED = "#8a8d96";

const STILL_WIDTH = 1200;
const STILL_HEIGHT = 675;
const PADDING = 56;

function drawHorizonGlow(ctx, width, height) {
  const cx = width * 0.88;
  const cy = height * 0.28;
  const radius = Math.min(width, height) * 0.34;
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, "rgba(201, 212, 232, 0.34)");
  gradient.addColorStop(0.38, "rgba(201, 212, 232, 0.08)");
  gradient.addColorStop(0.72, "rgba(201, 212, 232, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawStrandPath(ctx, pathD) {
  const tokens = pathD.match(/[MLQ]|[-\d.]+/g) ?? [];
  let index = 0;
  let x = 0;
  let y = 0;

  const readNumber = () => Number(tokens[index++]);

  ctx.beginPath();
  while (index < tokens.length) {
    const command = tokens[index++];
    if (command === "M") {
      x = readNumber();
      y = readNumber();
      ctx.moveTo(x, y);
    } else if (command === "L") {
      x = readNumber();
      y = readNumber();
      ctx.lineTo(x, y);
    } else if (command === "Q") {
      const cpx = readNumber();
      const cpy = readNumber();
      x = readNumber();
      y = readNumber();
      ctx.quadraticCurveTo(cpx, cpy, x, y);
    }
  }

  ctx.strokeStyle = AMBER_DIM;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.stroke();
}

function drawThumbPlaceholder(ctx, x, y, width, height, isTonight) {
  const radius = 8;
  ctx.save();
  ctx.globalAlpha = isTonight ? 1 : 0.55;

  const gradient = ctx.createLinearGradient(x, y, x, y + height);
  if (isTonight) {
    gradient.addColorStop(0, "rgba(248, 200, 120, 0.95)");
    gradient.addColorStop(0.42, "rgba(196, 122, 44, 0.88)");
    gradient.addColorStop(1, "rgba(24, 18, 12, 0.96)");
  } else {
    gradient.addColorStop(0, "rgba(232, 165, 75, 0.22)");
    gradient.addColorStop(0.5, "rgba(50, 48, 44, 0.72)");
    gradient.addColorStop(1, "rgba(11, 12, 16, 0.95)");
  }

  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = isTonight
    ? "rgba(248, 226, 184, 0.85)"
    : "rgba(232, 165, 75, 0.28)";
  ctx.lineWidth = isTonight ? 2 : 1;
  ctx.stroke();

  if (isTonight) {
    ctx.shadowColor = "rgba(232, 165, 75, 0.45)";
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function drawBead(ctx, x, y, radius, isTonight) {
  if (isTonight) {
    ctx.beginPath();
    ctx.arc(x, y, radius + BEAD_HALO_EXTRA, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(232, 165, 75, 0.34)";
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x, y, radius + BEAD_HALO_EXTRA, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(232, 165, 75, 0.16)";
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = isTonight ? AMBER : "rgba(232, 165, 75, 0.82)";
  ctx.fill();
  ctx.strokeStyle = isTonight ? "#f8e2b8" : "rgba(244, 224, 180, 0.65)";
  ctx.lineWidth = isTonight ? 2.5 : 2;
  ctx.stroke();
}

function drawHeader(ctx, width) {
  ctx.fillStyle = TEXT;
  ctx.font = '600 22px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.textAlign = "left";
  ctx.fillText("R U N U P", PADDING, PADDING + 22);
}

function drawFooter(ctx, width, height, { queueHours, daysLeft, queueLength, horizon }) {
  const line = `~${queueHours}h in queue · ${formatDaysLeft(daysLeft)} · ${queueLength} titles`;
  const subline = `Horizon ${horizon} · unofficial catch-up`;

  ctx.textAlign = "left";
  ctx.fillStyle = TEXT;
  ctx.font = '500 20px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.fillText(line, PADDING, height - PADDING - 18);

  ctx.fillStyle = MUTED;
  ctx.font = '400 14px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.fillText(subline, PADDING, height - PADDING + 8);
}

export function renderShareStill({
  queueLength,
  queueHours,
  horizon,
}) {
  const canvas = document.createElement("canvas");
  canvas.width = STILL_WIDTH;
  canvas.height = STILL_HEIGHT;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = VOID;
  ctx.fillRect(0, 0, STILL_WIDTH, STILL_HEIGHT);
  drawHorizonGlow(ctx, STILL_WIDTH, STILL_HEIGHT);

  const fieldTop = 120;
  const fieldHeight = STILL_HEIGHT - fieldTop - 110;
  const layout = getThreadfieldLayout(queueLength || 1);
  const scale = Math.min(
    (STILL_WIDTH - PADDING * 2) / layout.width,
    fieldHeight / layout.height,
  );
  const offsetX = PADDING + (STILL_WIDTH - PADDING * 2 - layout.width * scale) / 2;
  const offsetY = fieldTop + (fieldHeight - layout.height * scale) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  const { positions, thumbSize } = layout;
  const strandPath = strandPathFromPoints(positions);

  positions.forEach((point, index) => {
    const isTonight = index === 0;
    drawThumbPlaceholder(
      ctx,
      point.x - thumbSize.width / 2,
      point.thumbY,
      thumbSize.width,
      thumbSize.height,
      isTonight,
    );
  });

  drawStrandPath(ctx, strandPath);

  positions.forEach((point, index) => {
    const isTonight = index === 0;
    const radius = point.beadRadius ?? getBeadRadius(isTonight);
    drawBead(ctx, point.x, point.y, radius, isTonight);
  });

  ctx.restore();

  drawHeader(ctx, STILL_WIDTH);
  drawFooter(ctx, STILL_WIDTH, STILL_HEIGHT, {
    queueHours,
    daysLeft: daysUntilHorizon(horizon),
    queueLength,
    horizon,
  });

  return canvas;
}

export function downloadShareStill(model) {
  const canvas = renderShareStill({
    queueLength: model.queue.length,
    queueHours: model.hours,
    horizon: model.catalog.horizon,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create share image"));
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "runup-threadfield.png";
      link.click();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}
