import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const catalogPath = path.join(root, "data/official-15.json");
const outPath = path.join(root, "content/official-15.md");

function formatRuntime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const titles = [...catalog.titles].sort((a, b) => a.order - b.order);
const totalMin = titles.reduce((sum, title) => sum + title.runtimeMin, 0);
const totalHours = Math.round((totalMin / 60) * 10) / 10;

const listItems = titles
  .map((title, index) => {
    const runtime = formatRuntime(title.runtimeMin);
    return `${index + 1}. **${title.title}** (${title.year}) — ${runtime}  
   ${title.spoilerSafeWhy}`;
  })
  .join("\n\n");

const markdown = `---
title: "Official 15 MCU catch-up list for Avengers: Doomsday"
description: "The full Disney+ Official 15 homework list in spoiler-safe watch order for Avengers: Doomsday, with runtimes and blurbs for each title."
horizon: "${catalog.horizon}"
titleCount: ${titles.length}
totalHours: ${totalHours}
source: "${catalog.source}"
disclaimer: "${catalog.disclaimer}"
---

# The Official 15 homework list

Spoiler-safe watch order for the Disney+ catch-up list ahead of *Avengers: Doomsday* (${catalog.horizon}). ${titles.length} titles · ~${totalHours}h total runtime.

If you are searching for what to watch before *Avengers: Doomsday*, the Disney+ Official 15 homework list is the press-reported catch-up path. This page lists every title in order with spoiler-safe notes only — no plot reveals.

## Watch order

${listItems}

## About this list

${catalog.disclaimer}

Source: ${catalog.source}. Horizon ${catalog.horizon}.
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, markdown);
console.log(`Wrote ${outPath}`);
