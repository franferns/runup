# Runup — session handoff

**Date:** 2 Sep 2026  
**Repo:** `/Users/francisfernandes/Documents/cursor/dom/runup` → [franferns/runup](https://github.com/franferns/runup)  
**Branch:** `cursor/slice-7-google-tv` (from `main` @ `934d061`)  
**Status:** v0 shipped on `main` (PR #2). **Slice 7 in progress — all work uncommitted** (see [Git state](#git-state)).

---

## What this app is

Unofficial, spoiler-safe catch-up guide for *Avengers: Doomsday* (horizon **18 Dec 2026**). Not affiliated with Marvel or Disney.

**Job:** Given what the user already watched and how much time they have, show the **shortest remaining queue** on the Disney+ Official 15 track.

**Metaphor:** The **Threadfield** — an amber strand with poster thumbnails + beads toward a horizon glow. Not a checklist app.

**Slice 7 add-on:** A **Google TV companion** (`android/`) pairs with the web app via **Supabase** so the couch can open Tonight in Disney+, mark Already seen, and Skip — with bidirectional sync.

---

## Quick start

### Web

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

**Posters:** TMDB CDN (`VITE_ENABLE_POSTERS=true`). Set `false` for gradient placeholders.

**Pairing (optional):** Create `.env` with:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ENABLE_POSTERS=true
```

Without Supabase env vars, pairing UI falls back to static “install the TV app” copy.

### Supabase

See [`supabase/README.md`](./supabase/README.md). Migrations + five edge functions live in `supabase/`. Deploy before pairing works end-to-end.

### Android TV

See [`android/README.md`](./android/README.md).

```bash
cd android
# Create local.properties with SUPABASE_URL, SUPABASE_ANON_KEY, CATALOG_URL
./gradlew assembleDebug
./gradlew installDebug   # TV emulator or device
```

---

## Slice completion

| Slice | Status | Notes |
|-------|--------|-------|
| 0 — sanity | ✅ | Vite + React + catalog |
| 1 — placement | ✅ | Four pins, `localStorage`, confirm on persona change |
| 2 — Tonight card | ✅ | Already seen / Watch tonight / Skip; Google search + On your TV panel |
| 3 — horizon chrome | ✅ | Hours in queue, days to Doomsday, **Fit to pace** |
| 4 — Threadfield | ✅ | SVG strand, line-draw on Already seen, poster thumbs |
| 5 — list fallback | ✅ | Full ordered list, reduced-motion → `/list` |
| 6 — PWA + share still | ✅ | `public/manifest.json`, icons, `src/shareStill.js` |
| 7 — Google TV | 🚧 | In progress on this branch — see below |

---

## Slice 7 progress (this branch)

Full plan: [`docs/plans/slice-7-google-tv.md`](./docs/plans/slice-7-google-tv.md)  
ADR: [`docs/adr/0002-tv-companion-via-supabase-pairing.md`](./docs/adr/0002-tv-companion-via-supabase-pairing.md)

### Done (local, uncommitted)

| Area | What shipped |
|------|----------------|
| **Catalog** | `catalogVersion: 1` + per-title `streaming` (`provider`, `contentId`, `searchQuery`) in `data/official-15.json`. Copied to `public/data/` on `npm run build` via `catalog:public` script. |
| **Supabase** | Migration `20260831000000_tv_pairing.sql`. Edge functions: `session-bootstrap`, `pairing-code`, `pair`, `state`, `devices`. Realtime on `sessions`. |
| **Web pairing** | `src/pairing.js` — session bootstrap, code generation, device list, unpair, remote state PATCH, Realtime subscribe. `src/usePairingSync.js` — hydrate on load, debounced sync on state change. Wired in `App.jsx`. |
| **Tonight UI** | `TonightCard.jsx` — 6-digit code, expiry countdown, QR (`pairQrUrl`), paired device list, unpair controls. Graceful fallback when Supabase not configured. |
| **Android scaffold** | Full `android/` project — Kotlin + Compose for TV. Pairing gate, **Threadfield + placement + Tonight** (see divergence below), Disney+ launcher, 15s polling, catalog assets from repo. Debug APK builds. |
| **Void polish** | Atmospheric backgrounds (`public/backgrounds/`), `scripts/generate-void-background.py`. |
| **Docs** | `CONTEXT.md` updated (Pairing, Streaming, Google TV app). `README.md` Slice 7 section. |

### Not done / blocked

| Item | Notes |
|------|-------|
| **Supabase deployed** | Schema + functions exist in repo; must be linked and deployed to a live project for pairing to work. |
| **`TV_APP_URL`** | Still `null` in `src/watchTonight.js` — set when Play Store listing exists. |
| **`.env.example`** | Deleted in working tree — restore before commit (see env vars below). |
| **`android/local.properties.example`** | Referenced in README but not present — create or document inline. |
| **End-to-end verification** | Full pairing loop not confirmed on emulator + live Supabase in this session. |
| **Play Store listing** | No published TV app yet. |
| **Physical Google TV test** | Emulator only so far. |

### Spec divergence (important)

ADR 0002 and the Slice 7 plan say: **Tonight only on TV — no placement, no Threadfield.**

The current Android app (`MainActivity.kt`, `RunupViewModel.kt`) implements:

1. Pairing gate
2. **Placement screen** (four pins on TV)
3. **Threadfield screen** with Tonight actions, horizon chrome, Fit to pace

Decide before merge: **strip TV back to Tonight-only** (per ADR) or **update ADR** to allow full TV experience. Web still owns placement in the pairing model; TV placement is redundant if sync works.

### Known bug

`src/usePairingSync.js` line 26 calls `loadState()` but does not import it from `./storage.js`. Realtime updates from TV will throw at runtime until fixed.

---

## TV install from web (design decision)

**Same Wi‑Fi does not help.** Browsers cannot detect LAN devices or push install intents to a Google TV.

**What works:**

1. **Play Store URL** on phone → user installs remotely if same Google account is on TV (`TV_APP_URL` → `https://play.google.com/store/apps/details?id=com.runup.tv`)
2. **QR encoding that URL** — scan on phone, install to TV via Play Store “Install on [device]”
3. **Manual** — search “Runup” in Play Store on the TV

Pairing remains **code-based via Supabase**, not network proximity.

---

## Domain model (read before changing behavior)

Canonical glossary: [`CONTEXT.md`](./CONTEXT.md)  
ADR: [`docs/adr/0001-persona-vs-budget-hours.md`](./docs/adr/0001-persona-vs-budget-hours.md)  
Build plan: [`IMPLEMENTATION.md`](./IMPLEMENTATION.md)

### Key decisions

1. **Three personas** + separate **`budgetHours`** — fourth pin = `official-15` + `budgetHours: 8`.
2. **Queue pipeline:** Official 15 `order` → minus `persona.treatAsWatched` → minus `watchedIds` → minus `skippedIds` → head-keep by `budgetHours`.
3. **Already seen** vs **Skip:** both leave queue; only Already seen counts as watched.
4. **Pairing:** 6-digit code (~10 min TTL), multiple TVs per session, set-union merge for `watchedIds` / `skippedIds`.
5. **Watch tonight (web):** expand card → Google search + On your TV panel (code/QR when Supabase configured).
6. **Posters:** TMDB `tmdbPosterPath` in `data/official-15.json`, behind `VITE_ENABLE_POSTERS`.

---

## Architecture

### Web routing (`src/App.jsx`)

- Client router in `src/useRouter.js` (no react-router).
- `placementMode` — “Change placement” shows Void without clearing persona until a new pin is chosen.
- `usePairingSync` hydrates from Supabase on load and syncs state changes.

### Core web modules

| File | Role |
|------|------|
| `src/path.js` | `remainingQueue()`, `queueHours()` |
| `src/storage.js` | load/save `runup.v1`, mark actions, placement |
| `src/queueModel.js` | Shared `{ persona, queue, tonight, hours }` |
| `src/pairing.js` | Supabase client, pairing API, Realtime |
| `src/usePairingSync.js` | Hydrate + debounced remote sync |
| `src/watchTonight.js` | `TV_APP_URL`, `googleSearchUrl`, `formatRuntime` |
| `src/shareStill.js` | Canvas strand PNG export (Slice 6) |

### Views

| File | Role |
|------|------|
| `src/Void.jsx` + `Placement.jsx` | Landing + four pins + atmosphere |
| `src/ThreadfieldView.jsx` | Strand + Tonight + horizon + share still |
| `src/ListView.jsx` | Full list + Tonight aside |
| `src/TonightCard.jsx` | Tonight actions + On your TV pairing panel |
| `src/HorizonChrome.jsx` | Hours + days + Fit to pace |

### Android (`android/`)

| File | Role |
|------|------|
| `RunupViewModel.kt` | Pairing, placement, queue, marks, polling |
| `MainActivity.kt` | Pairing → Placement → Threadfield flow |
| `ui/PairingScreen.kt` | 6-digit code entry |
| `ui/ThreadfieldScreen.kt` | Strand + Tonight + horizon |
| `ui/PlacementScreen.kt` | Four pins on TV |
| `domain/RemainingQueue.kt` | Port of web queue math |
| `util/StreamingLauncher.kt` | Disney+ deep link + search fallback |
| `data/SessionRepository.kt` | `sessionId` + `deviceToken` in prefs |

### Supabase (`supabase/`)

| Piece | Role |
|-------|------|
| `migrations/20260831000000_tv_pairing.sql` | `sessions`, `pairing_codes`, `devices` |
| `functions/session-bootstrap` | Create session, seed state |
| `functions/pairing-code` | Generate 6-digit code |
| `functions/pair` | TV enters code → `deviceToken` |
| `functions/state` | GET/PATCH `runup.v1` shape |
| `functions/devices` | List / unpair |

### `localStorage` keys

| Key | Shape |
|-----|-------|
| `runup.v1` | `{ v, personaId, budgetHours, watchedIds, skippedIds }` |
| `runup.session` | `{ sessionId }` — Supabase session |

---

## Pairing flow

```
Web (Watch tonight → On your TV)          Supabase                    Android TV
────────────────────────────────          ────────                    ──────────
ensureSession() → sessionId               sessions row
createPairingCode() → 6-digit code    ←→  pairing_codes
QR → runup.app/pair?code=…                                           User enters code
                                                                     POST /pair → deviceToken
listDevices() ← paired TVs                devices row
markAlreadySeen / placement          ←→  state PATCH + Realtime  →  refreshState()
```

---

## Verification checklist (Slice 7)

| # | Test | Expected |
|---|------|----------|
| 1 | Web without `.env` | Static TV install copy; no pairing errors |
| 2 | Web with Supabase | Code + QR + device list in On your TV |
| 3 | TV pair with code | TV shows Threadfield / Tonight matching web head |
| 4 | Already seen on TV | Title leaves queue on web (Realtime) |
| 5 | Skip on TV | Gone from strand; not in `watchedIds` |
| 6 | Unpair on web | TV re-pair on next open |
| 7 | Open in provider | Disney+ or search fallback |
| 8 | Empty queue | Path-complete screen |

Fix `usePairingSync` import before relying on test 4.

---

## Git state

**Branch:** `cursor/slice-7-google-tv`  
**Base:** `main` @ `934d061` (Merge PR #2 — Runup v0)

**Modified:** `CONTEXT.md`, `HANDOFF.md`, `IMPLEMENTATION.md`, `README.md`, `data/official-15.json`, `package.json`, `package-lock.json`, `src/App.jsx`, `src/Placement.jsx`, `src/TonightCard.jsx`, `src/Void.jsx`, `src/placementOptions.js`, `src/styles.css`

**Deleted:** `.env.example`

**New (untracked):** `android/`, `supabase/`, `docs/adr/0002-*.md`, `docs/plans/`, `public/backgrounds/`, `public/data/`, `scripts/generate-void-background.py`, `src/pairing.js`, `src/usePairingSync.js`

Suggested first steps in a new session:

```bash
git status
# Fix usePairingSync loadState import
# Restore .env.example
# Decide TV scope (Tonight-only vs full Threadfield)
# Deploy Supabase, test pairing loop on emulator
git add -A
git commit -m "Slice 7: Supabase pairing, web sync, Android TV companion."
```

---

## What to build next

1. Fix `usePairingSync.js` missing `loadState` import
2. Restore `.env.example` and add `android/local.properties.example`
3. Deploy Supabase (link project, `db push`, deploy functions)
4. End-to-end pairing test (web ↔ emulator)
5. Resolve Android scope vs ADR (Tonight-only or update ADR)
6. Set `TV_APP_URL` when Play Store listing is live
7. Phase 7 polish: offline errors, TV focus order, physical device test

### Explicitly later

- 166-title catalog, Google sync, JustWatch, Fox/Sony JSON, iOS App Store

---

## Rules (do not break)

- Brand: **Runup** — not “MCU Watchlist”.
- No Marvel/Disney logos in shipped UI.
- `spoilerSafeWhy` copy must stay spoiler-safe.
- Honor `prefers-reduced-motion`.
- Bottom chrome = hours + days to horizon, not a video player.

---

## Prompt for next session

```
Continue Runup from HANDOFF.md on branch cursor/slice-7-google-tv.

Read: CONTEXT.md, docs/adr/0002-tv-companion-via-supabase-pairing.md,
docs/plans/slice-7-google-tv.md.

Priority: fix usePairingSync bug, restore .env.example, deploy Supabase,
verify pairing loop on TV emulator. Decide whether Android stays
Tonight-only (per ADR) or keeps Threadfield + placement.
```
