const MIN_WIDTH = 960;
const HEIGHT = 480;
const THUMB_GAP = 40;
const SCROLL_THUMB_GAP = 28;
const EDGE_PADDING = 72;
const SCROLL_EDGE_PADDING = 48;
const THUMB_BEAD_GAP = 10;

export const SCROLL_MODE_BREAKPOINT = 900;

export const BEAD_RADIUS = {
  tonight: 14,
  regular: 11,
};

export const BEAD_HALO_EXTRA = 8;

export function getBeadRadius(isTonight = false) {
  return isTonight ? BEAD_RADIUS.tonight : BEAD_RADIUS.regular;
}

export function getThumbSize(count, scrollMode = false) {
  if (scrollMode) {
    if (count > 12) {
      return { width: 92, height: 138 };
    }

    if (count > 8) {
      return { width: 104, height: 156 };
    }

    return { width: 118, height: 177 };
  }

  if (count > 12) {
    return { width: 96, height: 144 };
  }

  if (count > 8) {
    return { width: 112, height: 168 };
  }

  return { width: 128, height: 192 };
}

export function getThreadfieldLayout(count, options = {}) {
  const { scrollMode = false } = options;
  const thumbSize = getThumbSize(count, scrollMode);
  const thumbGap = scrollMode ? SCROLL_THUMB_GAP : THUMB_GAP;
  const edgePadding = scrollMode ? SCROLL_EDGE_PADDING : EDGE_PADDING;
  const step = thumbSize.width + thumbGap;
  const contentWidth =
    count <= 1
      ? thumbSize.width
      : thumbSize.width + step * (count - 1);
  const width = scrollMode
    ? edgePadding * 2 + contentWidth
    : Math.max(MIN_WIDTH, edgePadding * 2 + contentWidth);
  const positions = getNodePositions(count, thumbSize, { thumbGap, edgePadding });

  return {
    width,
    height: HEIGHT,
    positions,
    thumbSize,
    scrollMode,
  };
}

function getNodePositions(count, thumbSize, { thumbGap, edgePadding }) {
  if (count === 0) {
    return [];
  }

  const startX = edgePadding + thumbSize.width / 2;
  const step = thumbSize.width + thumbGap;

  return Array.from({ length: count }, (_, index) => {
    const t = count === 1 ? 0.35 : index / (count - 1);
    const x = startX + index * step;
    const y = HEIGHT * 0.8 - Math.sin(t * Math.PI) * 36;
    const isTonight = index === 0;
    const beadRadius = getBeadRadius(isTonight);

    return {
      x,
      y,
      t,
      beadRadius,
      thumbY: y - beadRadius - THUMB_BEAD_GAP - thumbSize.height,
    };
  });
}

export function strandPathFromPoints(points) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    const point = points[0];
    return `M ${point.x} ${point.y} L ${point.x + 120} ${point.y - 28}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const controlX = (previous.x + current.x) / 2;

    path += ` Q ${controlX} ${previous.y} ${current.x} ${current.y}`;
  }

  return path;
}

export function segmentPath(points, fromIndex = 0) {
  if (points.length === 0) {
    return "";
  }

  const start = points[fromIndex];
  const end = points[fromIndex + 1];

  if (!end) {
    return `M ${start.x} ${start.y} L ${start.x + 110} ${start.y - 24}`;
  }

  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
}

export function getCenteredScrollLeft(
  focusX,
  viewportWidth,
  contentWidth,
  scale = 1,
) {
  if (viewportWidth <= 0) {
    return 0;
  }

  const scaledFocus = focusX * scale;
  const scaledWidth = contentWidth * scale;
  const ideal = scaledFocus - viewportWidth / 2;
  const maxScroll = Math.max(0, scaledWidth - viewportWidth);

  return Math.min(maxScroll, Math.max(0, ideal));
}

export function getFitScale(
  artboardWidth,
  artboardHeight,
  viewportWidth,
  viewportHeight,
  options = {},
) {
  const { scrollMode = false } = options;
  const heightScale =
    viewportHeight > 0 && artboardHeight > viewportHeight
      ? viewportHeight / artboardHeight
      : 1;

  if (scrollMode) {
    return heightScale;
  }

  if (!viewportWidth || !artboardWidth) {
    return heightScale;
  }

  const widthScale =
    artboardWidth <= viewportWidth ? 1 : viewportWidth / artboardWidth;

  return Math.min(widthScale, heightScale);
}

export function getCenteredPanOffset(
  focusX,
  viewportWidth,
  contentWidth,
  scale = 1,
) {
  if (viewportWidth <= 0) {
    return 0;
  }

  const scaledFocus = focusX * scale;
  const scaledWidth = contentWidth * scale;
  const ideal = viewportWidth / 2 - scaledFocus;
  const minOffset = Math.min(0, viewportWidth - scaledWidth);

  return Math.min(0, Math.max(minOffset, ideal));
}

export function getCameraOffset(points, focusIndex = 0, viewportPadding = 140) {
  if (points.length === 0) {
    return 0;
  }

  const focusPoint = points[focusIndex] ?? points[0];
  const focusX = focusPoint.x;
  return -Math.max(0, focusX - viewportPadding);
}

export const THREADFIELD_HEIGHT = HEIGHT;
