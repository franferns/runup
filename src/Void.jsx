import catalog from "../data/official-15.json";
import Placement from "./Placement.jsx";

export default function Void({ state, onPlaced }) {
  return (
    <div className="shell">
      <header>
        <div className="brand">RUNUP</div>
        <p className="disclaimer">{catalog.disclaimer}</p>
      </header>
      <main className="hero">
        <div>
          <h1>PLACE YOURSELF</h1>
          <p>Drop a pin on where your story already is.</p>
        </div>
      </main>
      <Placement currentState={state} onPlaced={onPlaced} />
      <p className="data-note">
        Horizon {catalog.horizon} · Disney+ Official 15
      </p>
    </div>
  );
}
