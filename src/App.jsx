import catalog from "../data/official-15.json";

const MOCKS = [
  {
    src: "/mocks/runup-01-void-landing.png",
    title: "Void",
    caption: "Place yourself",
    wide: true,
  },
  {
    src: "/mocks/runup-02-placement.png",
    title: "Placement",
    caption: "Drop a pin on a lane",
    wide: true,
  },
  {
    src: "/mocks/runup-03-threadfield.png",
    title: "Threadfield",
    caption: "Remaining path toward the horizon",
    wide: true,
  },
  {
    src: "/mocks/runup-04-tonight.png",
    title: "Tonight",
    caption: "One title, three actions",
    wide: true,
  },
  {
    src: "/mocks/runup-05-mobile.png",
    title: "Mobile",
    caption: "Tonight-first on a phone",
    wide: false,
  },
];

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
      <section className="mocks" aria-labelledby="mocks-heading">
        <h2 id="mocks-heading">Screens</h2>
        <p className="mocks-lead">
          Design frames for the catch-up path. These are mockups, not live
          product chrome.
        </p>
        <ul className="mock-grid">
          {MOCKS.map((mock) => (
            <li
              key={mock.src}
              className={mock.wide ? "mock-card mock-card-wide" : "mock-card mock-card-phone"}
            >
              <figure>
                <img src={mock.src} alt={`${mock.title}: ${mock.caption}`} />
                <figcaption>
                  <strong>{mock.title}</strong>
                  <span>{mock.caption}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>
      <p className="data-note">
        Official 15 loaded · {catalog.titles.length} titles · ~{hours}h · horizon{" "}
        {catalog.horizon}
      </p>
    </div>
  );
}
