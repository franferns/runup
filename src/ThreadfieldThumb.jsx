import { useState } from "react";
import { posterUrl } from "./posters.js";
import { getThumbSize } from "./threadfieldLayout.js";

function shortTitle(title) {
  const words = title.split(/\s+/);
  if (words.length <= 3) {
    return title;
  }

  return `${words.slice(0, 3).join(" ")}…`;
}

export default function ThreadfieldThumb({
  title,
  thumbSize: thumbSizeProp,
  isTonight,
  isWatched,
  isCompleting,
  queueLength,
}) {
  const thumbSize = thumbSizeProp ?? getThumbSize(queueLength);
  const { width, height } = thumbSize;
  const showLabel = queueLength <= 8;
  const imageUrl = posterUrl(title);
  const [imageFailed, setImageFailed] = useState(false);
  const showPhoto = imageUrl && !imageFailed;
  const showTick = isWatched || isCompleting;

  let className = "threadfield-thumb";
  if (isWatched || isCompleting) {
    className += " is-watched";
  } else if (isTonight) {
    className += " is-tonight";
  } else {
    className += " is-dim";
  }

  return (
    <div className={className} style={{ width, height }}>
      {showPhoto ? (
        <img
          className="threadfield-thumb-photo"
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="threadfield-thumb-art" aria-hidden="true" />
      )}
      {showLabel && (
        <div className="threadfield-thumb-copy">
          <p className="threadfield-thumb-title">{shortTitle(title.title)}</p>
          <p className="threadfield-thumb-year">{title.year}</p>
        </div>
      )}
      {showTick && (
        <span className="threadfield-thumb-tick" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="12" height="12" fill="none">
            <path
              d="M4 10.5 8 14.5 16 6.5"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  );
}
