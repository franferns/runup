import { useState } from "react";
import { posterUrl } from "./posters.js";
import { formatRuntime, googleSearchUrl, TV_APP_URL } from "./watchTonight.js";

export default function TonightCard({
  title,
  onAlreadySeen,
  onSkip,
  actionsDisabled = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  if (!title) {
    return (
      <section className="tonight-card tonight-card-empty" aria-live="polite">
        <p className="tonight-eyebrow">Tonight</p>
        <h2 className="tonight-title">Path complete</h2>
        <p className="tonight-why">Nothing left on this queue. You are caught up.</p>
      </section>
    );
  }

  const searchUrl = googleSearchUrl(title);
  const imageUrl = posterUrl(title);
  const showPhoto = imageUrl && !imageFailed;

  return (
    <section
      className={`tonight-card${expanded ? " tonight-card-expanded" : ""}`}
      aria-labelledby="tonight-heading"
    >
      <div className="tonight-card-body">
        <div className="tonight-poster" aria-hidden="true">
          {showPhoto ? (
            <img
              className="tonight-poster-photo"
              src={imageUrl}
              alt=""
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="tonight-poster-art" />
          )}
        </div>

        <div className="tonight-copy">
          <p className="tonight-eyebrow">Tonight</p>
          <h2 id="tonight-heading" className="tonight-title">
            {title.title}
          </h2>
          <p className="tonight-meta">
            {title.year} · {formatRuntime(title.runtimeMin)}
          </p>
          <p className="tonight-why">{title.spoilerSafeWhy}</p>
        </div>
      </div>

      {!expanded ? (
        <div className="tonight-actions" role="group" aria-label="Tonight actions">
          <button
            type="button"
            className="tonight-action"
            onClick={onAlreadySeen}
            disabled={actionsDisabled}
          >
            Already seen
          </button>
          <button
            type="button"
            className="tonight-action tonight-action-primary"
            onClick={() => setExpanded(true)}
            disabled={actionsDisabled}
          >
            Watch tonight
          </button>
          <button
            type="button"
            className="tonight-action"
            onClick={onSkip}
            disabled={actionsDisabled}
          >
            Skip
          </button>
        </div>
      ) : (
        <div className="tonight-watch-panel">
          <a
            className="tonight-search-link"
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Search for this title
          </a>

          <div className="tonight-tv-guide">
            <h3>On your TV</h3>
            <p>
              Install the Runup Google TV app on Android TV to open titles
              directly in Disney+ or your streaming provider.
            </p>
            {TV_APP_URL ? (
              <a href={TV_APP_URL} target="_blank" rel="noopener noreferrer">
                Get the TV app
              </a>
            ) : (
              <p className="tonight-tv-soon">TV app link coming soon.</p>
            )}
          </div>

          <button
            type="button"
            className="text-button tonight-back"
            onClick={() => setExpanded(false)}
          >
            Back to actions
          </button>
        </div>
      )}
    </section>
  );
}
