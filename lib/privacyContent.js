import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const contentPath = path.join(process.cwd(), "content/privacy.md");

export function getPrivacyContent() {
  const raw = fs.readFileSync(contentPath, "utf8");
  const { data, content } = matter(raw);
  return { frontmatter: data, content };
}
