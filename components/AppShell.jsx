"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ListView from "./ListView.jsx";
import ThreadfieldView from "./ThreadfieldView.jsx";
import Void from "./Void.jsx";
import { usePrefersReducedMotion } from "../lib/motion.js";
import { hasProgress, loadState } from "../lib/storage.js";
import { resetProgressAndSync, syncPlacementToRemote, usePairingSync } from "../lib/usePairingSync.js";

export default function AppShell() {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = usePrefersReducedMotion();
  const [state, setState] = useState(null);
  const [placementMode, setPlacementMode] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setState(loadState());
  }, [pathname]);

  usePairingSync({ state, onStateChange: setState });

  const handlePlaced = useCallback(
    (nextState) => {
      setState(nextState);
      setPlacementMode(false);
      syncPlacementToRemote(nextState).catch(() => {});
      router.push(reduceMotion ? "/app/list" : "/app");
    },
    [router, reduceMotion],
  );

  const handleChangePlacement = useCallback(() => {
    setPlacementMode(true);
    router.push("/app");
  }, [router]);

  const handleStateChange = useCallback((nextState) => {
    setState(nextState);
  }, []);

  const handleResetProgress = useCallback(async () => {
    if (!state || resetting || !hasProgress(state)) {
      return;
    }

    if (
      !window.confirm(
        "Reset progress? This clears your watched and skipped titles on web and paired TVs.",
      )
    ) {
      return;
    }

    setResetting(true);
    try {
      const nextState = await resetProgressAndSync(state);
      setState(nextState);
    } finally {
      setResetting(false);
    }
  }, [resetting, state]);

  const handleOpenList = useCallback(() => {
    router.push("/app/list");
  }, [router]);

  const handleOpenThreadfield = useCallback(() => {
    router.push("/app");
  }, [router]);

  if (!state) {
    return null;
  }

  const isListView = pathname === "/app/list";

  if (isListView) {
    if (!state.personaId) {
      return <Void state={state} onPlaced={handlePlaced} />;
    }

    return (
      <ListView
        state={state}
        onChangePlacement={handleChangePlacement}
        onResetProgress={handleResetProgress}
        resetDisabled={resetting || !hasProgress(state)}
        onStateChange={handleStateChange}
        onOpenThreadfield={handleOpenThreadfield}
      />
    );
  }

  if (!state.personaId || placementMode) {
    return <Void state={state} onPlaced={handlePlaced} />;
  }

  return (
    <ThreadfieldView
      state={state}
      onChangePlacement={handleChangePlacement}
      onResetProgress={handleResetProgress}
      resetDisabled={resetting || !hasProgress(state)}
      onStateChange={handleStateChange}
      onOpenList={handleOpenList}
      reduceMotion={reduceMotion}
    />
  );
}
