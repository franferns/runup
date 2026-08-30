import catalog from "../data/official-15.json";

export default function App() {
  const hours = Math.round(
    catalog.titles.reduce((sum, title) => sum + title.runtimeMin, 0) / 60,
  );

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
      <div className="clusters" aria-hidden="true">
        <div className="cluster amber" />
        <div className="cluster violet" />
        <div className="cluster rust" />
        <div className="cluster teal" />
      </div>
      <p className="data-note">
        Official 15 loaded · {catalog.titles.length} titles · ~{hours}h · horizon{" "}
        {catalog.horizon}
      </p>
    </div>
  );
}
