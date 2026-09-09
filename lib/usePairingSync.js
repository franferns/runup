"use client";

import { useEffect } from "react";
import {
  hydrateFromRemote,
  mergeRunupState,
  pairingEnabled,
  subscribeToSession,
  syncStateToRemote,
} from "./pairing.js";
import { loadState, saveState } from "./storage.js";

export function usePairingSync({ state, onStateChange }) {
  useEffect(() => {
    if (!pairingEnabled) {
      return undefined;
    }

    let cancelled = false;

    hydrateFromRemote().then((merged) => {
      if (!cancelled) {
        onStateChange(merged);
      }
    });

    const unsubscribe = subscribeToSession((remoteState) => {
      const local = loadState();
      const merged = mergeRunupState(local, remoteState);
      saveState(merged);
      onStateChange(merged);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [onStateChange]);

  useEffect(() => {
    if (!pairingEnabled || !state) {
      return;
    }

    const timer = window.setTimeout(() => {
      syncStateToRemote(state).catch(() => {});
    }, 300);

    return () => window.clearTimeout(timer);
  }, [state]);
}

export async function syncPlacementToRemote(state) {
  await syncStateToRemote(state);
}

export { resetProgressAndSync } from "./pairing.js";
