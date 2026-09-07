# Social preview & OG image plan

**Status:** Not started  
**Goal:** Fix link-preview warnings from opengraph.xyz audit — large OG images, correct Twitter card, shorter social descriptions, aligned `www` canonicals.  
**Production URL:** `https://www.before-doomsday.com`  
**Parent plan:** [nextjs-discoverability.md](./nextjs-discoverability.md) (Phase 5)

---

## Prompt for a new session

Copy-paste:

```
Implement docs/plans/social-preview-seo.md.

Read first: app/page.jsx, app/official-15/page.jsx, lib/siteUrl.js.

Create OG images in public/og/, update metadata, set NEXT_PUBLIC_SITE_URL to www, redeploy, re-test on opengraph.xyz.
```

---

## Audit snapshot (Sep 2026)

Tested with [opengraph.xyz](https://www.opengraph.xyz) on `https://www.before-doomsday.com/`.

| Result | Count |
|--------|-------|
| Passed | 9 |
| Warnings | 3 |
| Errors | 1 |

### Issues to fix

| Issue | Severity | Current | Target |
|-------|----------|---------|--------|
| `og:image` aspect ratio | **Error** | 512×512 square icon | **1200×630** (1.91:1) |
| `twitter:card` | Warning | `summary` (small thumb) | `summary_large_image` |
| `og:description` length | Warning | 132 chars on `/` | ≤ 125 chars for social |
| `og:image` lacks headline | Warning | Icon only | Text on image (optional but recommended) |
| Canonical / sitemap host | Warning | `before-doomsday.com` (no `www`) | `www.before-doomsday.com` |

**Note:** These affect **social sharing** (Slack, iMessage, X, Reddit) more than Google ranking. Core SEO (SSR content, sitemap, JSON-LD) is already solid.

---

## Architecture

### Assets

```
public/og/
├── runup-home.png          # 1200×630 — landing /
└── runup-official-15.png   # 1200×630 — /official-15
```

### Metadata flow

```
lib/siteUrl.js              → canonical base (www)
lib/socialMeta.js (new)     → shared OG/Twitter helpers, description trim
app/page.jsx                → landing metadata
app/official-15/page.jsx    → metadata from frontmatter + OG image override
```

### Image spec (both assets)

| Property | Value |
|----------|-------|
| Dimensions | **1200 × 630 px** |
| Format | PNG or JPEG (PNG preferred for text) |
| Safe zone | Keep text inside ~100px margins (platforms crop edges) |
| Background | `#0b0c10` (void) with subtle horizon glow |
| Text color | `#f4f1ea` (text), `#e8a54b` (amber accent) |
| Required text | **RUNUP** + one line of value prop |
| Must include | “Unofficial fan project” (small, footer) |
| Must NOT include | Marvel / Disney logos, character art, TMDB posters |

**`runup-home.png` copy:**

- Title: `Runup`
- Subtitle: `Spoiler-safe catch-up for Avengers: Doomsday`
- Optional CTA: `Start your path`

**`runup-official-15.png` copy:**

- Title: `Official 15 homework list`
- Subtitle: `Full watch order · spoiler-safe blurbs`
- Optional: `15 titles · ~36h`

---

## Implementation phases

### Phase 0 — Canonical `www` alignment

**Goal:** Sitemap, canonical, and Open Graph URLs match the live host (`www.before-doomsday.com`).

- [ ] Update `lib/siteUrl.js` default to `https://www.before-doomsday.com`
- [ ] Set Vercel env `NEXT_PUBLIC_SITE_URL=https://www.before-doomsday.com`
- [ ] Redeploy and verify:
  - `curl -s https://www.before-doomsday.com/sitemap.xml | grep loc`
  - View-source: `<link rel="canonical"` uses `www`

**Effort:** 15 min

---

### Phase 1 — OG images

**Goal:** Replace 512×512 icon with proper 1200×630 images.

- [ ] Create `public/og/` directory
- [ ] Design + export `runup-home.png` (1200×630)
- [ ] Design + export `runup-official-15.png` (1200×630)
- [ ] Optional: add `scripts/generate-og-images.py` if regenerating from a template

**Tools (pick one):**

- Figma / Canva (manual)
- `GenerateImage` or design export from existing void background (`public/backgrounds/`)
- Python + Pillow script (match `styles/globals.css` colors)

**Effort:** 1–2 h (design-dependent)

---

### Phase 2 — Metadata code changes

**Goal:** Wire new images and fix Twitter card + description length.

- [ ] Create `lib/socialMeta.js`:
  - `trimSocialDescription(text, maxLen = 125)`
  - `ogImage(path, alt)` — returns `{ url, width: 1200, height: 630, alt }`
- [ ] Update `app/page.jsx`:
  - `openGraph.images` → `/og/runup-home.png`
  - `twitter.card` → `summary_large_image`
  - Shorten `description` / `openGraph.description` to ≤ 125 chars
- [ ] Update `app/official-15/page.jsx`:
  - `openGraph.images` → `/og/runup-official-15.png`
  - `twitter.card` → `summary_large_image`
  - Trim `frontmatter.description` for OG/Twitter if > 125 chars (keep full text in `<meta name="description">` for Google if desired — see note below)
- [ ] Update `.env.example` → `NEXT_PUBLIC_SITE_URL=https://www.before-doomsday.com`

**Suggested landing description (124 chars):**

```
Spoiler-safe watch order for Avengers: Doomsday. Track the Disney+ Official 15 catch-up path before December 2026.
```

**Description strategy:**

| Tag | Max length | Notes |
|-----|------------|-------|
| `meta name="description"` | ~155 chars | Google SERP — can stay longer |
| `og:description` / `twitter:description` | ≤ 125 chars | Social previews — trim in code |

**Effort:** 30–45 min

---

### Phase 3 — Deploy & verify

- [ ] `npm run build` passes locally
- [ ] Push to `main` → Vercel auto-deploy
- [ ] Re-test on [opengraph.xyz](https://www.opengraph.xyz):
  - `https://www.before-doomsday.com/`
  - `https://www.before-doomsday.com/official-15`
- [ ] Target: **0 errors**, warnings only for optional “conversion text” if skipped
- [ ] Share test in iMessage or Slack — large image card visible
- [ ] Optional: [Twitter Card Validator](https://cards-dev.twitter.com/validator)

**Effort:** 20 min

---

### Phase 4 — Search Console (optional follow-up)

- [ ] Confirm sitemap re-crawled with `www` URLs
- [ ] No action needed if property is already `https://www.before-doomsday.com`

**Effort:** 10 min

---

## File checklist

| File | Action |
|------|--------|
| `public/og/runup-home.png` | Create |
| `public/og/runup-official-15.png` | Create |
| `lib/socialMeta.js` | Create |
| `lib/siteUrl.js` | Update default to `www` |
| `app/page.jsx` | OG image, twitter card, trim description |
| `app/official-15/page.jsx` | OG image, twitter card |
| `.env.example` | `www` URL |
| Vercel env | `NEXT_PUBLIC_SITE_URL=https://www.before-doomsday.com` |

---

## Testing checklist

| Check | Command / action |
|-------|------------------|
| OG image exists | `curl -sI https://www.before-doomsday.com/og/runup-home.png` → 200 |
| OG dimensions in HTML | View-source: `og:image:width` = 1200, height = 630 |
| Twitter large card | View-source: `twitter:card` = `summary_large_image` |
| Description length | `og:description` ≤ 125 chars on `/` |
| Canonical www | `curl -s https://www.before-doomsday.com/ \| grep canonical` |
| opengraph.xyz | 0 errors on both public URLs |
| Social share | Paste link in iMessage — large preview image |

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| OG cache stale after deploy | Wait 1–24h or use platform debuggers to refresh |
| Trademark on image | Text only; no Marvel/Disney logos or character art |
| Split description (Google vs social) | Use longer `metadata.description`, shorter `openGraph.description` |
| `www` vs apex redirect loop | Vercel Domains: apex → 308 → `www` (already configured) |

---

## Out of scope

- Animated OG / video cards
- Per-route dynamic OG via `opengraph-image.tsx` (can add later)
- A/B testing preview copy
- Paid social ad creatives

---

## Estimated effort

| Phase | Time |
|-------|------|
| 0 — www canonical | 15 min |
| 1 — OG images | 1–2 h |
| 2 — Metadata code | 45 min |
| 3 — Deploy & verify | 20 min |
| **Total** | **~2–3 h** |

---

## Success criteria

1. opengraph.xyz shows **0 errors** for `/` and `/official-15`
2. `og:image` is **1200×630** on both public pages
3. `twitter:card` is **`summary_large_image`**
4. Social descriptions ≤ **125 characters**
5. Canonical, sitemap, and OG URLs use **`https://www.before-doomsday.com`**
6. Link shared in iMessage/Slack shows a **large image card**, not a small square icon
