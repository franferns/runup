export default function VoidAtmosphere() {
  return (
    <div className="void-atmosphere" aria-hidden="true">
      <picture className="void-backdrop">
        <source
          media="(min-width: 900px)"
          srcSet="/backgrounds/void-atmosphere.jpg"
        />
        <img
          src="/backgrounds/void-atmosphere-sm.jpg"
          alt=""
          decoding="async"
          fetchPriority="high"
        />
      </picture>
      <div className="void-atmosphere-veil" />
      <div className="void-cosmic-shimmer" />
      <div className="void-doom-shimmer" />
      <svg className="void-strand" viewBox="0 0 1200 320" preserveAspectRatio="none">
        <path
          className="void-strand-path"
          d="M0 260 Q 280 220 520 236 T 980 180 T 1200 140"
        />
        <path
          className="void-strand-path void-strand-path-dim"
          d="M0 280 Q 320 250 600 262 T 1100 210"
        />
      </svg>
      <div className="void-stars" />
    </div>
  );
}
