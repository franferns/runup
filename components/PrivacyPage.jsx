import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getPrivacyContent } from "../lib/privacyContent.js";
import VoidAtmosphere from "./VoidAtmosphere.jsx";

export default function PrivacyPage() {
  const { frontmatter, content } = getPrivacyContent();

  return (
    <div className="shell official15-shell">
      <VoidAtmosphere />

      <header className="official15-header">
        <div className="brand">RUNUP</div>
        <p className="disclaimer">{frontmatter.disclaimer}</p>
      </header>

      <main className="official15-main official15-markdown">
        <ReactMarkdown>{content}</ReactMarkdown>

        <div className="official15-cta landing-ctas">
          <Link href="/" className="landing-cta">
            Back to home
          </Link>
          <Link href="/app" className="landing-cta landing-cta-primary">
            Open the app
          </Link>
        </div>
      </main>

      <footer className="official15-footer">
        <p className="data-note">
          Effective {frontmatter.effectiveDate} ·{" "}
          <Link href="/official-15">Official 15 list</Link>
        </p>
      </footer>
    </div>
  );
}
