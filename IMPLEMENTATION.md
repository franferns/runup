# Runup — local implementation plan

Unofficial catch-up for *Avengers: Doomsday* (18 Dec 2026). Not affiliated with Marvel or Disney.

Domain language lives in [`CONTEXT.md`](./CONTEXT.md). Architectural decisions in [`docs/adr/`](./docs/adr/).

Work from a clone of [franferns/runup](https://github.com/franferns/runup). Use branch `cursor/include-mock-screens-9b39` (or merge it to `main`) so you have `public/mocks/` and the Screens gallery.

```bash
git clone https://github.com/franferns/runup.git
cd runup
git checkout cursor/include-mock-screens-9b39
npm install
npm run dev
```

Open the URL Vite prints. Mock frames live at `/design` once Slice 1 ships (product owns `/`).

---

## What you are building

Not another MCU checklist.

**Job:** given what the user already saw and how many hours they have before 18 Dec 2026, show the **shortest remaining queue**, spoiler-safe.

**UI:** prestige cinema (dark void, film-credit type). The interactive metaphor is the **Threadfield** (2.5D strands → horizon). The mocks in `public/mocks/` are the visual target, not the live engine yet.

**Default track:** Disney+ Official 15 (`data/official-15.json`).

---

## Already in the repo

| Piece | Where |
|--------|--------|
| Vite + React | `package.json`, `src/` |
| Official 15 catalog | `data/official-15.json` |
| Void landing | `src/App.jsx` |
| Mock PNGs on the site | `public/mocks/runup-01` … `05` |
| Gitignore for local export folder | `runup-export/` ignored |
| Domain glossary | `CONTEXT.md` |

Do not rebuild those unless you are replacing them.

---

## Rules (do not skip)

- No Marvel/Disney logos, no character likenesses, no poster art unless you later add TMDB behind a flag.
- Brand name **Runup** — not “MCU Watchlist”.
- “Why this title” copy must stay spoiler-safe (see JSON `spoilerSafeWhy`).
- Honor `prefers-reduced-motion`: no camera dollies; default to list view after placement.
- Bottom chrome is **hours until 18 Dec 2026**, not a video player.
- Ship as a **PWA / web app**. Do not put “Marvel” in an App Store name.
- Keep a **list view** at `/list` that uses the same data (a11y + SEO later).

---

## Suggested stack (v0)

Stay on Vite + React. Add later, not on day one:

- Motion: CSS + [Motion](https://motion.dev/) or GSAP for the **line-draw** only
- Field: **2D canvas or SVG** first. React Three Fiber only if 2D is clearly not enough
- State: React state + `localStorage` (`runup.v1`)
- No auth until placement + tonight + mark-watched work

---

## Data you will add

Keep `data/official-15.json`. Add:

**`data/personas.json`**

```json
[
  {
    "id": "after-endgame",
    "label": "I stopped after Endgame",
    "treatAsWatched": ["cap-first-avenger", "the-avengers-2012", "infinity-war", "endgame"]
  },
  {
    "id": "x-men-lane",
    "label": "I mostly know X-Men",
    "treatAsWatched": ["x-men-2000", "x2-2003"]
  },
  {
    "id": "official-15",
    "label": "Disney+ Official 15",
    "treatAsWatched": []
  }
]
```

Persona logic uses **`treatAsWatched` only**. Catalog flags like `typicallyBeforeEndgame` are editor metadata — not runtime queue rules.

**Time budget** (`budgetHours`) is separate from persona — see [ADR 0001](./docs/adr/0001-persona-vs-budget-hours.md). The fourth placement pin is a combo shortcut: `personaId: "official-15"` + `budgetHours: 8`.

**Remaining queue** pipeline:

1. Official 15 in `order`
2. Minus persona `treatAsWatched`
3. Minus user `watchedIds`
4. Minus user `skippedIds`
5. Head-keep by `budgetHours` (walk from front; drop titles after budget exceeded)

**Tonight** = index 0 of the remaining queue.

---

## Build order (do in this sequence)

Each slice should run locally (`npm run dev`) before you start the next.

### Slice 0 — local sanity (30 min)

- [ ] Clone, `npm install`, `npm run dev`
- [ ] Confirm `/mocks/runup-03-threadfield.png` loads
- [ ] Read `data/official-15.json` end to end

### Slice 1 — placement (no 3D)

Replace the decorative clusters with **four tappable targets** matching mock 02:

1. I stopped after Endgame → `personaId: "after-endgame"`
2. I mostly know X-Men → `personaId: "x-men-lane"`
3. Disney+ Official 15 → `personaId: "official-15"`
4. I have 8 hours total → `personaId: "official-15"` + `budgetHours: 8`

- [ ] Clicking a pin writes `personaId` (and `budgetHours` when applicable) to `localStorage`
- [ ] Changing persona shows confirm: *"Change starting point? This resets your watched and skipped titles."* — on confirm, reset `watchedIds`, `skippedIds`, and `budgetHours` (unless new pin sets a budget)
- [ ] Route switches to **remaining list** at `/list` (plain list is OK here) or Threadfield at `/` depending on motion preference
- [ ] Move Screens gallery to `/design`; product owns `/`

**Done when:** refresh the tab, the same persona (and budget) is still selected.

### Slice 2 — tonight card (mock 04)

- [ ] Remaining queue index 0 is **Tonight**
- [ ] Full-viewport (mobile) or bottom sheet (desktop) with title, year, runtime, `spoilerSafeWhy`
- [ ] Actions: **Already seen** · **Watch tonight** · **Skip**
- [ ] **Already seen** → add to `watchedIds`, dequeue, bright line-draw then node removed (Slice 4)
- [ ] **Skip** → add to `skippedIds`, dequeue, node omitted from Threadfield (not counted as watched)
- [ ] **Watch tonight** → expand card inline: (1) Google search link for the title, (2) TV install guidance (QR / Play Store link to Google TV companion app). Does not dequeue.

**Done when:** you can clear three titles and see the queue shorten.

### Slice 3 — hours vs horizon

- [ ] `horizon` is `2026-12-18`
- [ ] Show **hours left in remaining queue** and **calendar days to horizon**
- [ ] If remaining hours / days-left > ~2h per day, show a calm **pace warning** and a **Fit to pace** control → sets `budgetHours = daysLeft × 2`, head-keep applied

**Done when:** marking a title watched drops the hour number.

### Slice 4 — Threadfield v0 (mock 03)

SVG or canvas in `src/Threadfield.jsx`:

- [ ] One strand (amber) with N nodes = **remaining titles only** (strand length is progress)
- [ ] Selected node = tonight
- [ ] Camera: CSS `translateX` toward the right (horizon glow). **No orbit**
- [ ] On Already seen: **stroke a line** to the next node (1–2s, ease-out, no bounce), then remove completed node
- [ ] Skipped titles do not appear on the strand

**Done when:** the line-draw matches the “cool” moment in the plan; `prefers-reduced-motion` skips animation.

### Slice 5 — list fallback

- [ ] `/list` renders the same remaining queue as an ordered list
- [ ] If `prefers-reduced-motion: reduce`, default to `/list` after placement
- [ ] Link to Threadfield from list (no motion effects if they visit)

### Slice 6 — PWA + share still (optional)

- [ ] `manifest.json` + icons (original art, not Marvel); `start_url: "/"`
- [ ] Canvas snapshot of the strand → download PNG (no spoilers in the image)

### Slice 7 — Google TV companion (post-v0)

**Stack:** Kotlin + Jetpack Compose for TV in `android/` (monorepo). **Sync:** Supabase (pairing codes, session state, realtime). See ADR 0002.

#### Catalog

- [ ] Add nested `streaming` object per title in `official-15.json`: `provider`, `contentId` (optional), `searchQuery` (fallback)
- [ ] Add `catalogVersion` (or equivalent) for TV background refresh
- [ ] Curate canonical provider path for all 15 titles (X-Men may not be Disney+)

#### Supabase

- [ ] Tables: `pairing_codes` (code, session_id, expires_at), `sessions` (state JSON = `runup.v1` shape), `devices` (session_id, device_token)
- [ ] Pairing code: 6 digits, ~10 min TTL, reusable within window (multiple TVs)
- [ ] Bidirectional state writes; `watchedIds` / `skippedIds` merged as set-union
- [ ] Realtime subscription on `sessions` for TV and web

#### Web (extends Slice 2)

- [ ] On your TV panel in Watch tonight: show pairing code + QR, device list, unpair controls
- [ ] Wire `TV_APP_URL` in `src/watchTonight.js` when Play Store listing exists
- [ ] Generate pairing code on demand; regenerate when expired

#### Android TV app

- [ ] Pairing gate on cold start (no standalone placement)
- [ ] Tonight screen: poster, title, runtime, spoiler-safe why, Open in provider, Already seen, Skip
- [ ] Open in provider: `contentId` → provider intent; fallback → `searchQuery` via global search
- [ ] Path-complete screen when queue empty (mirror web empty Tonight copy + horizon)
- [ ] Catalog: bundled in APK + background refresh from deployed `official-15.json`
- [ ] Store `sessionId` + `deviceToken` in prefs; persistent until unpair
- [ ] Orphan handling: clear message + re-pair if session ended on web

**Done when:** user pairs from web, opens TV app, taps Open in provider for Tonight, marks Already seen on TV, and web queue updates via realtime.

### Explicitly later (do not start here)

- Google sync / household
- JustWatch affiliate widget
- 166-title completist catalog (+ "Shed to Official 15 only" control when a wider catalog exists)
- Fox/Sony as a second JSON file
- App Store (web PWA only for v0)

---

## File map to create

```
src/
  App.jsx              # routing: / void+field | /list | /design
  storage.js           # load/save runup.v1
  path.js              # remainingQueue(catalog, persona, watchedIds, skippedIds, budgetHours)
  Threadfield.jsx      # slice 4
  TonightCard.jsx      # slice 2
  Placement.jsx        # slice 1
data/
  official-15.json     # exists
  personas.json        # add
public/
  mocks/               # exists — keep; gallery at /design
docs/
  adr/                 # exists
CONTEXT.md             # domain glossary
```

---

## `localStorage` shape

```json
{
  "v": 1,
  "personaId": "after-endgame",
  "budgetHours": null,
  "watchedIds": ["loki-s1"],
  "skippedIds": []
}
```

`budgetHours` is `null` when no budget is active. The fourth pin sets `8`.

---

## Definition of v0 (stop here)

A new user can:

1. Place “stopped after Endgame” (or another pin)
2. See a remaining Official 15 queue
3. Mark titles already seen or skip them
4. See hours-to-horizon update; fit queue to pace when behind
5. See a simple strand + line-draw (or reduced-motion list)
6. Expand Watch tonight for search + TV app install guidance

They do **not** need Three.js, auth, the Google TV app, or the 166-title dump.

---

## Design target (keep the mocks)

| File | Screen |
|------|--------|
| `public/mocks/runup-01-void-landing.png` | First paint (`/`) |
| `public/mocks/runup-02-placement.png` | Slice 1 |
| `public/mocks/runup-03-threadfield.png` | Slice 4 |
| `public/mocks/runup-04-tonight.png` | Slice 2 |
| `public/mocks/runup-05-mobile.png` | Tonight-first layout |

Gallery at `/design`. If a slice looks like a checklist with glow, it is wrong. Compare to mock 03/04 before merging.

---

## Git while you work locally

```bash
git checkout -b cursor/your-slice-name
# implement one slice
git add -p
git commit -m "Short description of the slice."
git push -u origin HEAD
```

Open a PR into `main` on `franferns/runup`.
