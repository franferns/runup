import { formatRuntime } from "./watchTonight.js";

export default function RemainingQueueList({ queue, headingId = "queue-heading" }) {
  if (queue.length === 0) {
    return <p className="list-empty">Nothing left on this path.</p>;
  }

  return (
    <ol className="title-list" aria-labelledby={headingId}>
      {queue.map((title, index) => {
        const isTonight = index === 0;

        return (
          <li
            key={title.id}
            className={`title-list-item${isTonight ? " is-tonight" : ""}`}
            aria-current={isTonight ? "step" : undefined}
          >
            <span className="title-order">{index + 1}</span>
            <span className="title-main">
              {isTonight && <span className="title-badge">Tonight</span>}
              <strong>{title.title}</strong>
              <span className="title-sub">
                {title.year} · {formatRuntime(title.runtimeMin)}
              </span>
              <span className="title-why">{title.spoilerSafeWhy}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
