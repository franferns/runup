import { useEffect, useMemo, useRef, useState } from "react";
import { prefersReducedMotion } from "./motion.js";
import ThreadfieldThumb from "./ThreadfieldThumb.jsx";
import {
  BEAD_HALO_EXTRA,
  getBeadRadius,
  getCenteredPanOffset,
  getCenteredScrollLeft,
  getThreadfieldLayout,
  SCROLL_MODE_BREAKPOINT,
  segmentPath,
  strandPathFromPoints,
} from "./threadfieldLayout.js";

const DRAW_MS = 1500;

export default function Threadfield({
  strandQueue,
  isDrawing,
  completingId = null,
  onDrawComplete,
  reduceMotion = false,
}) {
  const drawPathRef = useRef(null);
  const scrollRef = useRef(null);
  const [dashLength, setDashLength] = useState(0);
  const [dashOffset, setDashOffset] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  const scrollMode = viewportWidth > 0 && viewportWidth < SCROLL_MODE_BREAKPOINT;

  const tonightIndex = useMemo(
    () => strandQueue.findIndex((title) => title.strandStatus === "tonight"),
    [strandQueue],
  );
  const completingIndex = useMemo(() => {
    if (!completingId) {
      return tonightIndex;
    }

    const index = strandQueue.findIndex((title) => title.id === completingId);
    return index >= 0 ? index : tonightIndex;
  }, [completingId, strandQueue, tonightIndex]);
  const focusIndex = tonightIndex >= 0 ? tonightIndex : 0;
  const drawFromIndex = completingIndex >= 0 ? completingIndex : 0;

  const layout = useMemo(
    () => getThreadfieldLayout(strandQueue.length, { scrollMode }),
    [strandQueue.length, scrollMode],
  );
  const { width, height, positions, thumbSize } = layout;
  const strandPath = useMemo(() => strandPathFromPoints(positions), [positions]);
  const drawSegment = useMemo(
    () => segmentPath(positions, drawFromIndex),
    [positions, drawFromIndex],
  );
  const focusX = positions[focusIndex]?.x ?? 0;
  const fitScale = useMemo(() => {
    if (!viewportWidth || scrollMode) {
      return 1;
    }

    return width <= viewportWidth ? 1 : viewportWidth / width;
  }, [viewportWidth, width, scrollMode]);
  const scaledWidth = width * fitScale;
  const scaledHeight = height * fitScale;
  const needsScroll = scaledWidth > viewportWidth;
  const panOffset = useMemo(() => {
    if (!viewportWidth || needsScroll) {
      return 0;
    }

    return getCenteredPanOffset(focusX, viewportWidth, width, fitScale);
  }, [viewportWidth, needsScroll, focusX, width, fitScale]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return undefined;
    }

    const updateWidth = () => {
      setViewportWidth(element.clientWidth);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!scrollRef.current || focusIndex < 0 || isDrawing) {
      return;
    }

    const scrollElement = scrollRef.current;
    const target = getCenteredScrollLeft(
      focusX,
      scrollElement.clientWidth,
      width,
      fitScale,
    );

    scrollElement.scrollTo({
      left: target,
      behavior: reduceMotion || prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [
    focusIndex,
    focusX,
    width,
    fitScale,
    strandQueue.length,
    reduceMotion,
    isDrawing,
  ]);

  useEffect(() => {
    if (!isDrawing || reduceMotion || prefersReducedMotion()) {
      return;
    }

    const pathEl = drawPathRef.current;
    if (!pathEl) {
      return;
    }

    const length = pathEl.getTotalLength();
    setDashLength(length);
    setDashOffset(length);

    const frame = requestAnimationFrame(() => {
      setDashOffset(0);
    });

    const timer = window.setTimeout(() => {
      onDrawComplete();
    }, DRAW_MS);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [isDrawing, drawSegment, onDrawComplete, reduceMotion]);

  if (strandQueue.length === 0) {
    return (
      <div className="threadfield threadfield-empty" aria-hidden="true">
        <div className="threadfield-horizon" />
      </div>
    );
  }

  return (
    <div className="threadfield" aria-hidden="true">
      <div className="threadfield-horizon" />
      <div
        ref={scrollRef}
        className={`threadfield-scroll${needsScroll ? " is-pan" : ""}`}
      >
        <div
          className="threadfield-camera"
          style={{
            width: scaledWidth,
            height: scaledHeight,
            transform: `translateX(${panOffset}px)`,
          }}
        >
          <div
            className="threadfield-artboard"
            style={{
              width,
              height,
              transform: `scale(${fitScale})`,
              transformOrigin: "top left",
            }}
          >
            <div className="threadfield-thumbs">
              {positions.map((point, index) => {
                const title = strandQueue[index];
                const isTonight = title.strandStatus === "tonight";
                const isWatched = title.strandStatus === "watched";
                const isCompleting = title.id === completingId;

                return (
                  <div
                    key={title.id}
                    className="threadfield-thumb-anchor"
                    style={{
                      left: point.x,
                      top: point.thumbY,
                      width: thumbSize.width,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <ThreadfieldThumb
                      title={title}
                      thumbSize={thumbSize}
                      isTonight={isTonight}
                      isWatched={isWatched}
                      isCompleting={isCompleting}
                      queueLength={strandQueue.length}
                    />
                  </div>
                );
              })}
            </div>

            <svg
              className="threadfield-svg"
              viewBox={`0 0 ${width} ${height}`}
              width={width}
              height={height}
            >
              <path className="threadfield-strand" d={strandPath} />
              {isDrawing && (
                <path
                  ref={drawPathRef}
                  className="threadfield-draw"
                  d={drawSegment}
                  style={{
                    strokeDasharray: dashLength,
                    strokeDashoffset: dashOffset,
                  }}
                />
              )}
              {positions.map((point, index) => {
                const title = strandQueue[index];
                const isTonight = title.strandStatus === "tonight";
                const isWatched = title.strandStatus === "watched";
                const isCompleting = title.id === completingId;
                const radius = point.beadRadius ?? getBeadRadius(isTonight);

                let nodeClass = "threadfield-node";
                if (isTonight) {
                  nodeClass += " is-tonight";
                }
                if (isWatched || isCompleting) {
                  nodeClass += " is-watched";
                }

                let groupClass = "threadfield-node-group";
                if (isWatched || isCompleting) {
                  groupClass += " is-watched";
                }

                return (
                  <g key={title.id} className={groupClass}>
                    <circle
                      className="threadfield-node-halo"
                      cx={point.x}
                      cy={point.y}
                      r={radius + BEAD_HALO_EXTRA}
                    />
                    <circle
                      className={nodeClass}
                      cx={point.x}
                      cy={point.y}
                      r={radius}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
      {needsScroll && (
        <p className="threadfield-scroll-hint">Swipe the strand to browse titles</p>
      )}
    </div>
  );
}
