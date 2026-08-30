import { PLACEMENT_OPTIONS } from "./placementOptions.js";
import {
  applyPlacement,
  loadState,
  placementMatchesState,
} from "./storage.js";

const CONFIRM_MESSAGE =
  "Change starting point? This resets your watched and skipped titles.";

export default function Placement({ currentState, onPlaced }) {
  const handleSelect = (placement) => {
    const state = currentState ?? loadState();

    if (state.personaId) {
      if (placementMatchesState(placement, state)) {
        onPlaced(state);
        return;
      }

      if (!window.confirm(CONFIRM_MESSAGE)) {
        return;
      }
    }

    const nextState = applyPlacement(placement);
    onPlaced(nextState);
  };

  return (
    <div className="placement" role="group" aria-label="Choose your starting point">
      {PLACEMENT_OPTIONS.map((option) => {
        const isSelected =
          currentState &&
          placementMatchesState(option, currentState);

        return (
          <button
            key={option.id}
            type="button"
            className={`placement-pin placement-pin-${option.tone}${isSelected ? " is-selected" : ""}`}
            onClick={() => handleSelect(option)}
            aria-pressed={isSelected || undefined}
          >
            <span className="placement-pin-glow" aria-hidden="true" />
            <span className="placement-pin-label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
