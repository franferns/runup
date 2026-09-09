"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createPairingCode,
  listDevices,
  pairQrUrl,
  pairPageUrl,
  pairingEnabled,
  unpairAllDevices,
  unpairDevice,
} from "../lib/pairing.js";
import { TV_APP_URL } from "../lib/watchTonight.js";

function formatCountdown(expiresAt) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) {
    return "Expired";
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatPairedSummary(devices) {
  if (devices.length === 1) {
    return `Paired: ${devices[0].label || "TV"}`;
  }
  return `Paired: ${devices.length} TVs`;
}

export default function TvPairingPanel({ standalone = false }) {
  const [code, setCode] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(pairingEnabled);
  const [codeLoading, setCodeLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [pairingOpen, setPairingOpen] = useState(false);

  const guideClass = standalone
    ? "pair-tv-panel"
    : "tonight-tv-guide";

  const refreshDevices = useCallback(async () => {
    if (!pairingEnabled) {
      return [];
    }
    try {
      const result = await listDevices();
      const list = result.devices ?? [];
      setDevices(list);
      return list;
    } catch {
      setDevices([]);
      return [];
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  const generateCode = useCallback(async () => {
    setCodeLoading(true);
    setError(null);
    try {
      const result = await createPairingCode();
      setCode(result.code);
      setExpiresAt(result.expiresAt);
    } catch (err) {
      setError(err.message);
    } finally {
      setCodeLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!pairingEnabled) {
      return;
    }
    refreshDevices().then((list) => {
      if (list.length === 0) {
        generateCode();
      }
    });
  }, [refreshDevices, generateCode]);

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
  const hasPairedDevices = devices.length > 0;
  const showCollapsed = hasPairedDevices && !manageOpen && !pairingOpen && !standalone;
  const showPairingCode = !hasPairedDevices || pairingOpen;

  const handleUnpair = async (deviceId) => {
    await unpairDevice(deviceId);
    const list = await refreshDevices();
    if (list.length === 0) {
      setManageOpen(false);
      setPairingOpen(false);
      await generateCode();
    }
  };

  const handleUnpairAll = async () => {
    await unpairAllDevices();
    setManageOpen(false);
    setPairingOpen(false);
    await refreshDevices();
    await generateCode();
  };

  const handlePairAnother = async () => {
    setPairingOpen(true);
    setCode(null);
    setExpiresAt(null);
    await generateCode();
  };

  if (!pairingEnabled) {
    return (
      <div className={guideClass}>
        {!standalone ? <h3>On your TV</h3> : null}
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

  if (devicesLoading) {
    return (
      <div className={guideClass}>
        {!standalone ? <h3>On your TV</h3> : null}
        <p className="tonight-tv-soon">Checking paired TVs…</p>
      </div>
    );
  }

  if (showCollapsed) {
    return (
      <div className={`${guideClass} tonight-tv-guide-collapsed`}>
        <div className="tonight-tv-paired-summary">
          <h3>On your TV</h3>
          <p className="tonight-tv-paired-status">{formatPairedSummary(devices)}</p>
        </div>
        <button
          type="button"
          className="text-button tonight-tv-manage"
          onClick={() => setManageOpen(true)}
        >
          Manage TVs
        </button>
      </div>
    );
  }

  return (
    <div className={guideClass}>
      {!standalone ? <h3>On your TV</h3> : null}

      {hasPairedDevices ? (
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
      ) : null}

      {standalone && hasPairedDevices && !pairingOpen ? (
        <button
          type="button"
          className="text-button tonight-tv-manage"
          onClick={handlePairAnother}
        >
          Pair another TV
        </button>
      ) : null}

      {manageOpen && !standalone ? (
        <>
          {!pairingOpen ? (
            <button
              type="button"
              className="text-button tonight-tv-manage"
              onClick={handlePairAnother}
            >
              Pair another TV
            </button>
          ) : null}
          <button
            type="button"
            className="text-button tonight-tv-manage"
            onClick={() => {
              setManageOpen(false);
              setPairingOpen(false);
              setCode(null);
              setExpiresAt(null);
            }}
          >
            Done
          </button>
        </>
      ) : null}

      {showPairingCode ? (
        <>
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
                width={220}
                height={220}
              />
              <p className="tonight-pairing-link">
                <a href={pairPageUrl(code)}>{pairPageUrl(code)}</a>
              </p>
            </div>
          ) : null}

          <button
            type="button"
            className="tonight-action"
            onClick={generateCode}
            disabled={codeLoading}
          >
            {expired ? "Regenerate code" : "Refresh code"}
          </button>
        </>
      ) : null}

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
