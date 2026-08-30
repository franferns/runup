import { useCallback, useEffect, useState } from "react";
import DesignGallery from "./DesignGallery.jsx";
import ListView from "./ListView.jsx";
import { prefersReducedMotion } from "./motion.js";
import { loadState } from "./storage.js";
import ThreadfieldView from "./ThreadfieldView.jsx";
import { useRouter } from "./useRouter.js";
import Void from "./Void.jsx";

export default function App() {
  const { path, navigate } = useRouter();
  const [state, setState] = useState(() => loadState());
  const [placementMode, setPlacementMode] = useState(false);

  const refreshState = useCallback(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    refreshState();
  }, [path, refreshState]);

  const handlePlaced = useCallback(
    (nextState) => {
      setState(nextState);
      setPlacementMode(false);
      navigate(prefersReducedMotion() ? "/list" : "/");
    },
    [navigate],
  );

  const handleChangePlacement = useCallback(() => {
    setPlacementMode(true);
    navigate("/");
  }, [navigate]);

  const handleStateChange = useCallback((nextState) => {
    setState(nextState);
  }, []);

  const handleOpenList = useCallback(() => {
    navigate("/list");
  }, [navigate]);

  const handleOpenThreadfield = useCallback(() => {
    navigate("/");
  }, [navigate]);

  if (path === "/design") {
    return <DesignGallery />;
  }

  if (path === "/list") {
    if (!state.personaId) {
      return <Void state={state} onPlaced={handlePlaced} />;
    }

    return (
      <ListView
        state={state}
        onChangePlacement={handleChangePlacement}
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
      onStateChange={handleStateChange}
      onOpenList={handleOpenList}
      reduceMotion={prefersReducedMotion()}
    />
  );
}
