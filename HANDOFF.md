# Runup — session handoff

**Date:** 30 Aug 2026  
**Repo:** `/Users/francisfernandes/Documents/cursor/dom/runup` (clone of [franferns/runup](https://github.com/franferns/runup))  
**Status:** Slices 1–5 implemented locally; Slice 6+ not started. **Changes are uncommitted** (see [Git state](#git-state)).

---

## What this app is

Unofficial, spoiler-safe catch-up guide for *Avengers: Doomsday* (horizon **18 Dec 2026**). Not affiliated with Marvel or Disney.

**Job:** Given what the user already watched and how much time they have, show the **shortest remaining queue** on the Disney+ Official 15 track.

**Metaphor:** The **Threadfield** — an amber strand with poster thumbnails + beads toward a horizon glow. Not a checklist app.

---

## Quick start

```bash
cd runup
npm install
npm run dev
```

| Route | Purpose |
|-------|---------|
| `/` | Void + placement (no persona), or **Threadfield** (persona set) |
| `/list` | Accessible list view + Tonight card |
| `/design` | Mock gallery (`public/mocks/runup-01` … `05`) |

**Posters:** Enabled by default via TMDB CDN (`VITE_ENABLE_POSTERS=true` in `.env.example`). Set `VITE_ENABLE_POSTERS=false` to use gradient placeholders.

---

## Slice completion

| Slice | Status | Notes |
|-------|--------|-------|
| 0 — sanity | ✅ | Vite + React + catalog |
| 1 — placement | ✅ | Four pins, `localStorage`, confirm on persona change, `/design` gallery |
| 2 — Tonight card | ✅ | Already seen / Watch tonight / Skip; inline search + TV install copy |
| 3 — horizon chrome | ✅ | Hours in queue, days to Doomsday, **Fit to pace** |
| 4 — Threadfield | ✅ | SVG strand, line-draw on Already seen, poster thumbs above beads |
| 5 — list fallback | ✅ | Full ordered list, reduced-motion → `/list`, View strand link |
| 6 — PWA + share still | ❌ | Next up |
| 7 — Google TV app | ❌ | Post-v0 |

---

## Domain model (read before changing behavior)

Canonical glossary: [`CONTEXT.md`](./CONTEXT.md)  
ADR: [`docs/adr/0001-persona-vs-budget-hours.md`](./docs/adr/0001-persona-vs-budget-hours.md)  
Build plan: [`IMPLEMENTATION.md`](./IMPLEMENTATION.md) (updated during grilling session)

### Key decisions (from grilling)

1. **Three personas** + separate **`budgetHours`** — not a fourth “eight-hours” persona. Fourth pin = `official-15` + `budgetHours: 8`.
2. **Queue pipeline:** Official 15 `order` → minus `persona.treatAsWatched` → minus `watchedIds` → minus `skippedIds` → head-keep by `budgetHours`.
3. **Already seen** vs **Skip:** both leave queue; only Already seen counts as watched. Skip vanishes from strand.
4. **Persona change** always confirms and resets `watchedIds`, `skippedIds`, `budgetHours` (unless new pin sets budget).
5. **Fit to pace** (not “Shed to Official 15”) → `budgetHours = daysLeft × 2`.
6. **Threadfield** shows **remaining nodes only**; line-draw then node removed. No persistent “watched” nodes on strand.
7. **Watch tonight (web):** expand card → Google search + TV app install guidance. Google TV deep-link is Slice 7.
8. **Posters:** TMDB `tmdbPosterPath` per title in `data/official-15.json`, behind `VITE_ENABLE_POSTERS`.

### Personas (`data/personas.json`)

| ID | `treatAsWatched` |
|----|------------------|
| `after-endgame` | Cap, Avengers, Infinity War, Endgame |
| `x-men-lane` | `x-men-2000`, `x2-2003` only |
| `official-15` | `[]` |

---

## `localStorage` shape (`runup.v1`)

```json
{
  "v": 1,
  "personaId": "after-endgame",
  "budgetHours": null,
  "watchedIds": ["loki-s1"],
  "skippedIds": []
}
```

Clear in DevTools → Application → Local Storage to reset.

---

## Architecture

### Routing (`src/App.jsx`)

- Lightweight client router in `src/useRouter.js` (no react-router).
- **`placementMode`** state: “Change placement” shows Void without clearing persona until a new pin is chosen.
- After placement: `prefers-reduced-motion` → `/list`, else `/`.

### Core modules

| File | Role |
|------|------|
| `src/path.js` | `remainingQueue()`, `queueHours()` |
| `src/storage.js` | load/save, `applyPlacement`, `markAlreadySeen`, `markSkipped`, `applyFitToPace` |
| `src/queueModel.js` | Shared `{ persona, queue, tonight, hours }` for views |
| `src/horizon.js` | Days to horizon, pace warning math |
| `src/posters.js` | TMDB poster URL builder |

### Views

| File | Role |
|------|------|
| `src/Void.jsx` + `Placement.jsx` | Landing + four pins |
| `src/ThreadfieldView.jsx` | Strand + Tonight card + horizon chrome |
| `src/ListView.jsx` | Full list + Tonight aside + horizon chrome |
| `src/Threadfield.jsx` | SVG strand, beads, poster thumbs, line-draw animation |
| `src/threadfieldLayout.js` | Dynamic width/spacing so thumbs don’t overlap |
| `src/ThreadfieldThumb.jsx` | Poster tile (bright = tonight, dim = others) |
| `src/TonightCard.jsx` | Tonight actions |
| `src/HorizonChrome.jsx` | Bottom bar: hours + days + Fit to pace |
| `src/DesignGallery.jsx` | `/design` mocks |

---

## Threadfield + posters (recent work)

### Layout

- Poster thumbnails sit **above** each bead.
- Sizes scale by queue length (~96×144 for 9–12 titles).
- **Horizontal scroll** when queue is wide (`threadfield-scroll`); strand width grows with `thumbWidth + 20px` gap per node.
- Tonight thumb: bright border/glow. Others: dimmed via CSS `filter` + opacity.

### Posters

- Each title has `tmdbPosterPath` in `data/official-15.json` (paths verified Aug 2026).
- Images loaded from `https://image.tmdb.org/t/p/w500{path}`.
- Attribution: “Posters via TMDB” in Threadfield meta line.
- `onError` on `<img>` falls back to gradient placeholder.

### Known polish opportunities

- Long queues (12+) still feel dense — consider showing labels only on tonight + next 2.
- Pace warning rarely fires with ~110 days left and ~30h queue (math is correct; threshold is ~2h/day).
- `TV_APP_URL` in `src/watchTonight.js` is `null` — Play Store link pending Slice 7.
- Compare live UI to `public/mocks/runup-03-threadfield.png` and `runup-04-tonight.png` before calling v0 done.

---

## What to build next

### Slice 6 — PWA + share still

From `IMPLEMENTATION.md`:

- [ ] `manifest.json` + original icons (not Marvel); `start_url: "/"`
- [ ] Canvas snapshot of strand → downloadable PNG (no spoilers in image)

### Slice 7 — Google TV companion (post-v0)

- Android TV app; deep-link Tonight’s title to OTT provider.
- Wire `TV_APP_URL` in `src/watchTonight.js` when published.

### Explicitly later

- 166-title catalog, Google sync, JustWatch, Fox/Sony JSON, App Store.

---

## Git state

**All implementation work from this session is local and uncommitted.**

Modified: `IMPLEMENTATION.md`, `data/official-15.json`, `src/App.jsx`, `src/styles.css`  
New: `CONTEXT.md`, `docs/adr/`, `data/personas.json`, most of `src/*`, `.env.example`

Suggested first step in new session:

```bash
git status
git checkout -b cursor/slices-1-5-threadfield
git add -A
git commit -m "Implement slices 1–5: placement, tonight, horizon, threadfield, list."
```

---

## Rules (do not break)

- Brand: **Runup** — not “MCU Watchlist”.
- No Marvel/Disney logos in shipped UI.
- `spoilerSafeWhy` copy must stay spoiler-safe.
- Honor `prefers-reduced-motion`.
- Bottom chrome = hours + days to horizon, not a video player.

---

## Prompt for next session

Copy-paste to continue:

```
Continue Runup from HANDOFF.md. Slice 6 next (PWA + share still).
Read CONTEXT.md and IMPLEMENTATION.md first. Repo is at [path].
Uncommitted work covers slices 1–5 + threadfield poster thumbs.
```
