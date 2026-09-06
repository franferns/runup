"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createPairingCode,
  listDevices,
  pairQrUrl,
  pairingEnabled,
  unpairAllDevices,
  unpairDevice,
} from "../lib/pairing.js";
import { posterUrl } from "../lib/posters.js";
import { formatRuntime, googleSearchUrl, TV_APP_URL } from "../lib/watchTonight.js";

function formatCountdown(expiresAt) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) {
    return "Expired";
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function TvPairingPanel() {
  const [code, setCode] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshDevices = useCallback(async () => {
    if (!pairingEnabled) {
      return;
    }
    try {
      const result = await listDevices();
      setDevices(result.devices ?? []);
    } catch {
      setDevices([]);
    }
  }, []);

  const generateCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await createPairingCode();
      setCode(result.code);
      setExpiresAt(result.expiresAt);
      await refreshDevices();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [refreshDevices]);

  useEffect(() => {
    if (!pairingEnabled) {
      return;
    }
    generateCode();
  }, [generateCode]);

  useEffect(() => {
    if (!expiresAt) {
      return undefined;
    }

    const tick = () => setCountdown(formatCountdown(expiresAt));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  const expired = expiresAt && new Date(expiresAt).getTime() <= Date.now();

  const handleUnpair = async (deviceId) => {
    await unpairDevice(deviceId);
    await refreshDevices();
  };

  const handleUnpairAll = async () => {
    await unpairAllDevices();
    await refreshDevices();
  };

  if (!pairingEnabled) {
    return (
      <div className="tonight-tv-guide">
        <h3>On your TV</h3>
        <p>
          Install the Runup Google TV app on Android TV to open titles directly
          in Disney+ or your streaming provider.
        </p>
        {TV_APP_URL ? (
          <a href={TV_APP_URL} target="_blank" rel="noopener noreferrer">
            Get the TV app
          </a>
        ) : (
          <p className="tonight-tv-soon">TV app link coming soon.</p>
        )}
        <p className="tonight-tv-soon">
          Pairing requires Supabase env vars (see README).
        </p>
      </div>
    );
  }

  return (
    <div className="tonight-tv-guide">
      <h3>On your TV</h3>
      <p>Enter this code on your Runup TV app to sync Tonight.</p>

      {error ? <p className="tonight-pairing-error">{error}</p> : null}

      {code ? (
        <div className="tonight-pairing-code-block">
          <p className="tonight-pairing-code" aria-label={`Pairing code ${code}`}>
            {code.slice(0, 3)} {code.slice(3)}
          </p>
          <p className="tonight-pairing-expiry">
            {expired ? "Code expired" : `Expires in ${countdown}`}
          </p>
          <img
            className="tonight-pairing-qr"
            src={pairQrUrl(code)}
            alt={`QR code for pairing code ${code}`}
            width={180}
            height={180}
          />
        </div>
      ) : null}

      <button
        type="button"
        className="tonight-action"
        onClick={generateCode}
        disabled={loading}
      >
        {expired ? "Regenerate code" : "Refresh code"}
      </button>

      {devices.length > 0 ? (
        <div className="tonight-device-list">
          <h4>Paired TVs</h4>
          <ul>
            {devices.map((device) => (
              <li key={device.id}>
                <span>{device.label || "TV"}</span>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => handleUnpair(device.id)}
                >
                  Unpair
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="text-button" onClick={handleUnpairAll}>
            Unpair all
          </button>
        </div>
      ) : (
        <p className="tonight-tv-soon">No TVs paired yet.</p>
      )}

      {TV_APP_URL ? (
        <a href={TV_APP_URL} target="_blank" rel="noopener noreferrer">
          Get the TV app
        </a>
      ) : (
        <p className="tonight-tv-soon">TV app link coming soon.</p>
      )}
    </div>
  );
}

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

          <TvPairingPanel />

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
