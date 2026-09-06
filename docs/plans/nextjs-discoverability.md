# Next.js discoverability plan

**Status:** In progress — Next.js migration shipped; markdown SEO content + deploy verification remain  
**Goal:** Make Runup findable in search and shareable on social — without exposing the interactive app as thin SPA shells.  
**Production URL:** `https://runup.app`  
**Prerequisite:** Slices 1–7 web features on `cursor/slice-7-google-tv` (or merged to `main`)

---

## Prompt for a new session

Copy-paste:

```
Implement the remaining discoverability work from docs/plans/nextjs-discoverability.md.

Read first: CONTEXT.md, IMPLEMENTATION.md, content/official-15.md.

Workspace is the runup repo root. Finish markdown content pipeline, verify static HTML in production, submit sitemap to Search Console.

Do not rewrite Threadfield logic. Do not add a 166-title catalog.
```

---

## Core idea: markdown for discoverability, JSON for the app

Runup has two kinds of data:

| Layer | Source | Used by | Purpose |
|-------|--------|---------|---------|
| **Structured catalog** | `data/official-15.json` | `/app`, Android TV, queue math | Runtime, streaming IDs, order, personas |
| **Discoverable content** | `content/*.md` | Public Next.js pages | Crawlable prose, headings, watch-order copy |

**Why markdown, not JSX or JSON alone?**

- Search engines and social crawlers need **real HTML text** in the first response — not React state.
- Markdown is easy to edit for SEO copy (intro paragraphs, keyword phrases) without touching components.
- Frontmatter drives `metadata` (title, description, canonical) in one place.
- A build script can **generate** markdown from JSON so titles/order stay in sync; humans can still tweak prose between regenerations.
- Markdown files are diff-friendly and readable in GitHub — good for a fan project others might fork.

**Rule:** JSON is the source of truth for *what* is in the list. Markdown is the source of truth for *how it reads on the public web*.

---

## What “discoverable” means for Runup

1. **Google/Bing** can index `/` and `/official-15` with full watch-order text visible in view-source (no JS required).
2. **Link previews** (Slack, iMessage, X) show title, description, and image from server-rendered `<meta>` tags.
3. **`/sitemap.xml`** lists public URLs; **`/robots.txt`** allows public pages, blocks `/app/`, `/design`, `/pair`.
4. **JSON-LD** on public pages (`WebSite`, `WebApplication`, `ItemList`) for rich-result eligibility.
5. **Android TV** still fetches `https://runup.app/data/official-15.json` — unchanged path.

---

## Architecture

### Route map

| Route | Rendering | Indexable? | Content source |
|-------|-----------|------------|----------------|
| `/` | SSG (Server Component) | Yes | `content/landing.md` (or inline metadata + component) |
| `/official-15` | SSG | Yes | **`content/official-15.md`** (primary SEO asset) |
| `/app` | Client Component | No (`noindex`) | Interactive tool |
| `/app/list` | Client Component | No | List view |
| `/design` | Client Component | No | Design gallery |
| `/pair` | Dynamic | No | TV pairing deep-link |

### Data flow

```
data/official-15.json
        │
        ├──────────────────────────────┐
        │                              │
        ▼                              ▼
scripts/generate-official-15-md.mjs   lib/catalog.js
        │                              │
        ▼                              ▼
content/official-15.md              /app (queue, tonight)
        │
        ▼
lib/official15Content.js  ──►  app/official-15/page.jsx
        │                         (metadata + JSON-LD + ReactMarkdown)
        ▼
   Static HTML at build time
```

### High-level layout

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js App Router (runup.app)                             │
├─────────────────────────────────────────────────────────────┤
│  PUBLIC (SSG) — discoverable                                │
│    /              → Landing (hero, disclaimer, CTA)         │
│    /official-15   → Watch order from content/official-15.md │
├─────────────────────────────────────────────────────────────┤
│  APP (Client Components) — interactive, noindex             │
│    /app           → Void → ThreadfieldView                  │
│    /app/list      → ListView                                │
│    /design        → DesignGallery                           │
│    /pair          → Pairing deep-link                       │
├─────────────────────────────────────────────────────────────┤
│  STATIC ASSETS                                              │
│    /data/official-15.json   ← TV catalog refresh              │
│    /backgrounds/*  /icons/*  /manifest.json                 │
├─────────────────────────────────────────────────────────────┤
│  SEO INFRA                                                  │
│    app/sitemap.js   → /, /official-15                       │
│    app/robots.js    → allow public, disallow /app /design   │
│    JSON-LD on / and /official-15                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Markdown content spec

### `content/official-15.md`

Generated by `scripts/generate-official-15-md.mjs` from `data/official-15.json`, with optional hand-edits to intro copy.

```markdown
---
title: "Official 15 MCU catch-up list for Avengers: Doomsday"
description: "The full Disney+ Official 15 homework list in spoiler-safe watch order..."
horizon: "2026-12-18"
titleCount: 15
totalHours: 36
source: "Disney+ homework list as reported by press (IGN / ScreenRant), Aug 2026"
disclaimer: "Unofficial fan project. Not affiliated with Marvel Entertainment or The Walt Disney Company."
---

# The Official 15 homework list

Spoiler-safe watch order for the Disney+ catch-up list ahead of *Avengers: Doomsday* ...

If you are searching for what to watch before *Avengers: Doomsday*, ...

## Watch order

1. **X-Men** (2000) — 1h 44m
   Introduces a team later stories assume you know.

2. **X2: X-Men United** (2003) — 2h 13m
   ...

## About this list

Unofficial fan project. ...
```

**Frontmatter fields used by Next.js:**

| Field | Used for |
|-------|----------|
| `title` | `metadata.title`, Open Graph, Twitter |
| `description` | `metadata.description` |
| `horizon` | Footer, intro copy |
| `titleCount`, `totalHours` | Footer stats |
| `source`, `disclaimer` | Footer, header disclaimer |

**Body:** rendered with `react-markdown` in a Server Component. Must include all 15 titles with `spoilerSafeWhy` blurbs.

### Future content pages (out of scope for v1)

| File | Route | When |
|------|-------|------|
| `content/landing.md` | `/` | Optional — move hero copy out of JSX |
| `content/faq.md` | `/faq` | Later — "what is the homework list?" long-tail |
| `content/titles/[slug].md` | `/titles/x-men-2000` | Later — 15 per-title indexable URLs |

---

## SEO content strategy

### Target search queries

- "Avengers Doomsday watch order"
- "MCU homework list 2026"
- "what to watch before Avengers Doomsday"
- "Disney+ Official 15 list"

### `/` — landing page

- **Title:** `Runup — spoiler-safe MCU catch-up for Avengers: Doomsday`
- **Visible copy:** 2–3 paragraphs explaining the tool (server-rendered, not hidden in JS)
- **CTA:** `/app` ("Start your path")
- **Secondary link:** `/official-15` ("See the Official 15 list")
- **JSON-LD:** `WebSite` + `WebApplication`

### `/official-15` — primary SEO page

- **Title / description:** from markdown frontmatter
- **H1:** in markdown body
- **Full ordered list** with year, runtime, spoiler-safe blurb per title
- **CTA:** `/app`
- **JSON-LD:** `ItemList` with `ListItem` entries (generated from `lib/catalog.js`, not parsed from MD)

### What we do **not** index

- `/app`, `/app/list` — user-specific queue; `robots: { index: false }` in `app/app/layout.jsx`
- `/design` — internal mocks
- `/pair` — ephemeral pairing codes

---

## File structure

```
runup/
├── app/
│   ├── layout.jsx
│   ├── page.jsx                    # Landing (SSG)
│   ├── official-15/page.jsx        # Reads content/official-15.md
│   ├── app/                        # Interactive tool (noindex)
│   ├── design/
│   ├── pair/
│   ├── sitemap.js
│   └── robots.js
├── content/
│   └── official-15.md              # SEO content (generated + editable)
├── components/
│   ├── LandingPage.jsx
│   └── Official15Page.jsx          # Renders markdown body
├── lib/
│   ├── catalog.js                  # JSON import for app + JSON-LD
│   └── official15Content.js        # gray-matter reader for MD
├── scripts/
│   └── generate-official-15-md.mjs # JSON → MD at build time
├── data/
│   └── official-15.json            # Catalog source of truth
├── public/
│   └── data/official-15.json       # Copied on build (TV refresh)
└── styles/globals.css
```

---

## Dependencies

```json
{
  "gray-matter": "parse frontmatter",
  "react-markdown": "render MD body in Server Component"
}
```

No MDX required for v1 — plain markdown + frontmatter is enough.

---

## Build scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "npm run catalog:public && npm run catalog:md && next build",
    "catalog:public": "mkdir -p public/data && cp data/official-15.json public/data/official-15.json",
    "catalog:md": "node scripts/generate-official-15-md.mjs"
  }
}
```

**Workflow when catalog changes:**

1. Edit `data/official-15.json`
2. Run `npm run catalog:md` (or `npm run build`)
3. Review `content/official-15.md` — re-apply any hand-edited SEO paragraphs if the script overwrote them
4. Deploy

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (`https://runup.app`), sitemap, OG URLs |
| `NEXT_PUBLIC_SUPABASE_URL` | Pairing (app only) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pairing (app only) |
| `NEXT_PUBLIC_ENABLE_POSTERS` | TMDB posters in app |

---

## Implementation phases

### Phase 0 — Next.js scaffold ✅ Done

- [x] Next.js 15 App Router
- [x] `styles/globals.css`, `public/` assets
- [x] Vite removed; `src/` removed
- [x] `.env.example` with `NEXT_PUBLIC_*` vars

### Phase 1 — Public SEO pages ✅ Done

- [x] `app/page.jsx` — landing with metadata + JSON-LD
- [x] `app/sitemap.js`, `app/robots.js`
- [x] `lib/catalog.js`
- [x] `components/LandingPage.jsx`, `components/Official15Page.jsx`

### Phase 2 — Port interactive app ✅ Done

- [x] `/app`, `/app/list` with `noindex` layout
- [x] `/design`, `/pair` routes
- [x] `/list` → `/app/list` redirect in `next.config.js`
- [x] Components + lib moved from `src/`

### Phase 3 — Markdown content pipeline ✅ Done

**Goal:** `/official-15` body and metadata come from `content/official-15.md`, not hardcoded JSX.

- [x] Create `content/official-15.md`
- [x] Create `scripts/generate-official-15-md.mjs`
- [x] Create `lib/official15Content.js` (gray-matter reader)
- [x] Wire `app/official-15/page.jsx` metadata to frontmatter
- [x] Render body with `react-markdown` in `Official15Page.jsx`
- [x] Add `catalog:md` to build script
- [x] **Verify:** `curl -s localhost:3000/official-15 | grep "X-Men"` returns matches without JS
- [x] **Verify:** view-source shows full 15-title list in `<ol>` or equivalent semantic HTML
- [x] Document in README: "edit catalog JSON → run catalog:md → deploy"
- [ ] Commit: `feat: official-15 SEO content from markdown`

### Phase 4 — Landing markdown (optional)

- [ ] Create `content/landing.md` with frontmatter + hero copy
- [ ] Create `lib/landingContent.js`
- [ ] Refactor `LandingPage.jsx` to render from MD
- [ ] Metadata in `app/page.jsx` reads frontmatter

Low priority — landing already has server-rendered copy in JSX. Do this if you want all public prose in `content/`.

### Phase 5 — OG image & polish

- [ ] Generate dedicated OG image (1200×630) — not just the square app icon
- [ ] Add `og:image` pointing to `/og/runup-official-15.png` on `/official-15`
- [ ] Add `metadata.alternates.canonical` on both public pages (partially done)
- [ ] Confirm disclaimer visible on every public page

### Phase 6 — Deploy & verify discoverability

**Blocker (Sep 2026):** `https://runup.app` currently serves a different product (Clerk-backed SaaS with `/privacy`, `/terms` — not this Next.js app). Deploy to Vercel first, then point DNS or choose another domain.

- [ ] Deploy to Vercel (or host) with `NEXT_PUBLIC_SITE_URL=https://runup.app` (or actual production URL)
- [ ] Confirm live URLs:
  - `https://runup.app/robots.txt`
  - `https://runup.app/sitemap.xml`
  - `https://runup.app/data/official-15.json`
- [ ] **Google Rich Results Test:** `/` and `/official-15`
- [ ] **Social preview test:** share `/official-15` in Slack/iMessage
- [ ] **Google Search Console:** add property, submit sitemap, request indexing
- [ ] **Bing Webmaster Tools:** submit sitemap (optional, feeds DuckDuckGo)

### Phase 7 — Off-site discovery (manual, ongoing)

- [ ] Post to r/MarvelStudios / r/MCU when relevant (follow sub rules; disclose unofficial)
- [ ] Share link with OG image before Dec 2026 horizon
- [ ] Link from GitHub README to live site

---

## Testing checklist

| Check | Command / action |
|-------|------------------|
| MD file exists | `cat content/official-15.md` has 15 numbered entries |
| Build regenerates MD | Edit JSON order → `npm run catalog:md` → MD updates |
| Landing HTML without JS | `curl -s https://runup.app/ \| grep -i "Avengers"` |
| Official 15 in source | `curl -s https://runup.app/official-15 \| grep "X-Men"` |
| Sitemap | `curl https://runup.app/sitemap.xml` |
| Robots blocks app | `curl https://runup.app/robots.txt` shows `Disallow: /app/` |
| App still works | Place persona → threadfield → mark seen → list view |
| TV catalog | `curl https://runup.app/data/official-15.json` returns JSON |
| Metadata from frontmatter | View source: `<title>` matches MD frontmatter `title` |

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| `catalog:md` overwrites hand-edited SEO copy | Script only regenerates list section; or use a `<!-- HAND_EDIT_START -->` block; document workflow |
| Thin-content penalty | Full 15-title list + unique `spoilerSafeWhy` blurbs in MD body |
| JSON and MD drift | Always run `catalog:md` after JSON edits; CI check that MD is fresh |
| Trademark issues | Keep "unofficial" in title/description; no Marvel/Disney logos |
| TV catalog URL breaks | Keep `catalog:public` in build; never move `/data/official-15.json` |

---

## Out of scope (later)

- Per-title pages `/titles/[slug]` (15 more indexable URLs)
- Blog / editorial content in `content/posts/`
- i18n
- `next/image` for TMDB posters on public pages
- RSS feed from markdown content

---

## Estimated effort (remaining)

| Phase | Time |
|-------|------|
| 3 — Markdown pipeline verification | 1 h |
| 4 — Landing markdown (optional) | 1–2 h |
| 5 — OG image | 1 h |
| 6 — Deploy & Search Console | 1–2 h |
| **Total remaining** | **~半 day** |

---

## Success criteria

1. `content/official-15.md` is the published source for `/official-15` body copy and page metadata
2. View-source on `/official-15` shows all 15 titles **without executing JavaScript**
3. `/sitemap.xml` lists `/` and `/official-15`
4. `/robots.txt` allows public pages, disallows `/app/`
5. Link previews show title, description, and image
6. `public/data/official-15.json` still available for Android TV
7. Interactive app fully works at `/app`
