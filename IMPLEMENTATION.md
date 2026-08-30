# Runup — local implementation plan

Unofficial catch-up for *Avengers: Doomsday* (18 Dec 2026). Not affiliated with Marvel or Disney.

Work from a clone of [franferns/runup](https://github.com/franferns/runup). Use branch `cursor/include-mock-screens-9b39` (or merge it to `main`) so you have `public/mocks/` and the Screens gallery.

```bash
git clone https://github.com/franferns/runup.git
cd runup
git checkout cursor/include-mock-screens-9b39
npm install
npm run dev
```

Open the URL Vite prints. Scroll to **Screens** to see the five mock frames.

---

## What you are building

Not another MCU checklist.

**Job:** given what the user already saw and how many hours they have before 18 Dec 2026, show the **shortest remaining path**, spoiler-safe.

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

Do not rebuild those unless you are replacing them.

---

## Rules (do not skip)

- No Marvel/Disney logos, no character likenesses, no poster art unless you later add TMDB behind a flag.
- Brand name **Runup** — not “MCU Watchlist”.
- “Why this title” copy must stay spoiler-safe (see JSON `spoilerSafeWhy`).
- Honor `prefers-reduced-motion`: no camera dollies; same flow, list layout.
- Bottom chrome is **hours until 18 Dec 2026**, not a video player.
- Ship as a **PWA / web app**. Do not put “Marvel” in an App Store name.
- Keep a **list view** that uses the same data (a11y + SEO later).

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
{
  "id": "after-endgame",
  "label": "I stopped after Endgame",
  "treatAsWatched": ["cap-first-avenger", "the-avengers-2012", "infinity-war", "endgame"]
}
```

Other personas (do after the first one works):

- `x-men-lane` — treat Fox X-Men titles as watched; MCU core unwatched
- `official-15` — empty watched set (full 15)
- `eight-hours` — not a watched set; a **budget**. Filter remaining titles until runtime ≤ 8h, Official 15 first

**Remaining path** = Official 15 in `order`, minus ids in the persona’s watched set (or minus what the user marks).

---

## Build order (do in this sequence)

Each slice should run locally (`npm run dev`) before you start the next.

### Slice 0 — local sanity (30 min)

- [ ] Clone, `npm install`, `npm run dev`
- [ ] Confirm `/mocks/runup-03-threadfield.png` loads
- [ ] Read `data/official-15.json` end to end

### Slice 1 — placement (no 3D)

Replace the decorative clusters with **four tappable targets** matching mock 02:

1. I stopped after Endgame  
2. I mostly know X-Men  
3. Disney+ Official 15  
4. I have 8 hours total  

- [ ] Clicking a pin writes `personaId` to `localStorage`
- [ ] Route or view switches to **remaining list** (plain list is OK here)
- [ ] Endgame persona hides Infinity-Saga titles that are `typicallyBeforeEndgame: true` except you still show X-Men / X2 / everything after Endgame

**Done when:** refresh the tab, the same persona is still selected.

### Slice 2 — tonight card (mock 04)

- [ ] Remaining path is a queue. Index 0 is **Tonight**
- [ ] Full-viewport (mobile) or bottom sheet (desktop) with title, year, runtime, `spoilerSafeWhy`
- [ ] Actions: **Already seen** · **Watch tonight** · **Skip**
- [ ] Already seen / Skip dequeue and show the next title
- [ ] Watch tonight can be `window.open` to a search URL or a static “Disney+” line — no scraping

**Done when:** you can clear three titles and see the queue shorten.

### Slice 3 — hours vs horizon

- [ ] `horizon` is `2026-12-18`
- [ ] Show **hours left in remaining queue** and **calendar days to horizon**
- [ ] If remaining hours / days-left > ~2h per day, show a calm warning and a control: “Shed to Official 15 only” (already the catalog)

**Done when:** marking a title watched drops the hour number.

### Slice 4 — Threadfield v0 (mock 03)

SVG or canvas in `src/Threadfield.jsx`:

- [ ] One strand (amber) with N nodes = remaining titles
- [ ] Dim nodes = unwatched; bright = watched
- [ ] Selected node = tonight
- [ ] Camera: CSS `translateX` toward the right (horizon glow). **No orbit**
- [ ] Mark watched: **stroke a line** to the next node (1–2s, ease-out, no bounce)

Keep the Screens gallery at `/` or move mocks to `/design`. Product UI can live at `/app`.

**Done when:** the line-draw matches the “cool” moment in the plan; `prefers-reduced-motion` skips it.

### Slice 5 — list fallback

- [ ] `/list` renders the same remaining path as an ordered list
- [ ] If `prefers-reduced-motion: reduce`, default to `/list` after placement

### Slice 6 — PWA + share still (optional)

- [ ] `manifest.json` + icons (original art, not Marvel)
- [ ] Canvas snapshot of the lit strand → download PNG (no spoilers in the image)

### Explicitly later (do not start here)

- Google sync / household
- JustWatch affiliate widget
- 166-title completist catalog
- Fox/Sony as a second JSON file
- App Store

---

## File map to create

```
src/
  App.jsx              # routing: void | placement | tonight | field
  storage.js           # load/save runup.v1
  path.js              # remainingTitles(catalog, persona, watchedIds)
  Threadfield.jsx      # slice 4
  TonightCard.jsx      # slice 2
  Placement.jsx        # slice 1
data/
  official-15.json     # exists
  personas.json        # add
public/
  mocks/               # exists — keep
```

---

## `localStorage` shape

```json
{
  "v": 1,
  "personaId": "after-endgame",
  "watchedIds": ["loki-s1"],
  "skippedIds": []
}
```

---

## Definition of v0 (stop here)

A new user can:

1. Place “stopped after Endgame”
2. See a remaining Official 15 queue
3. Mark titles already seen
4. See hours-to-horizon update
5. See a simple strand + line-draw (or reduced-motion list)

They do **not** need Three.js, auth, or the 166-title dump.

---

## Design target (keep the mocks)

| File | Screen |
|------|--------|
| `public/mocks/runup-01-void-landing.png` | First paint |
| `public/mocks/runup-02-placement.png` | Slice 1 |
| `public/mocks/runup-03-threadfield.png` | Slice 4 |
| `public/mocks/runup-04-tonight.png` | Slice 2 |
| `public/mocks/runup-05-mobile.png` | Tonight-first layout |

If a slice looks like a checklist with glow, it is wrong. Compare to mock 03/04 before merging.

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
