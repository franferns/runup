import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getOrderedTitles } from "../lib/catalog.js";
import { getOfficial15Content } from "../lib/official15Content.js";
import VoidAtmosphere from "./VoidAtmosphere.jsx";

export default function Official15Page() {
  const { frontmatter, content } = getOfficial15Content();
  const titles = getOrderedTitles();

  return (
    <div className="shell official15-shell">
      <VoidAtmosphere />

      <header className="official15-header">
        <div className="brand">RUNUP</div>
        <p className="disclaimer">{frontmatter.disclaimer}</p>
      </header>

      <main className="official15-main official15-markdown">
        <ReactMarkdown>{content}</ReactMarkdown>

        <div className="official15-cta">
          <Link href="/app" className="landing-cta landing-cta-primary">
            Start your path
          </Link>
        </div>
      </main>

      <footer className="official15-footer">
        <p className="data-note">
          Source: {frontmatter.source} · Horizon {frontmatter.horizon} ·{" "}
          {titles.length} titles · ~{frontmatter.totalHours}h total
        </p>
      </footer>
    </div>
  );
}
