# Slice 7 — Google TV companion — implementation plan

**Status:** Ready to build (spec agreed Aug 2026)  
**Prerequisite:** Slices 1–5 shipped; Slice 6 (PWA) optional but recommended before TV pairing UI ships  
**ADR:** [`docs/adr/0002-tv-companion-via-supabase-pairing.md`](../adr/0002-tv-companion-via-supabase-pairing.md)  
**Glossary:** [`CONTEXT.md`](../../CONTEXT.md) — Pairing, Paired session, Streaming, Google TV app

---

## Where to run this session

**Open Cursor at the `runup` folder** — not the parent `dom` folder.

```
/Users/francisfernandes/Documents/cursor/dom/runup   ← workspace root
```

Everything lives in this monorepo:

| Work | Location |
|------|----------|
| Web pairing UI | `src/TonightCard.jsx`, new `src/pairing.js` (or similar) |
| Catalog streaming metadata | `data/official-15.json` |
| Supabase migrations / edge functions | `supabase/` (create) |
| Android TV app | `android/` (create) |

You do **not** need a sibling repo or a parent-folder workspace. The Android project is `android/` inside `runup`.

---

## Prompt for a new session

Copy-paste:

```
Implement Slice 7 from docs/plans/slice-7-google-tv.md.

Read first: CONTEXT.md, docs/adr/0002-tv-companion-via-supabase-pairing.md, IMPLEMENTATION.md (Slice 7 section).

Workspace is the runup repo root. Build in order: catalog → Supabase → web pairing → Android TV app.

Do not port Threadfield to TV. Do not add standalone TV placement.
```

---

## What we're building

A **Kotlin + Jetpack Compose for TV** companion that:

1. Shows a **pairing gate** on cold start (no placement on TV)
2. After pairing, shows **Tonight only** — poster, title, runtime, spoiler-safe why
3. Actions: **Open in provider**, **Already seen**, **Skip**
4. **Path complete** screen when queue is empty
5. **Bidirectional sync** with web via **Supabase Realtime**

Web owns placement. TV is a couch remote for an already-configured queue.

---

## Architecture

```
┌─────────────────┐     pairing code      ┌─────────────────┐
│  Web PWA        │◄────────────────────►│  Supabase       │
│  (Vite/React)   │     state read/write  │  Postgres + RT  │
└────────┬────────┘                       └────────┬────────┘
         │                                         │
         │  Watch tonight → On your TV             │ Realtime
         │  (code + QR + unpair)                   │
         │                                         │
         │                                 ┌───────▼────────┐
         │                                 │  Android TV    │
         │                                 │  Compose app   │
         │                                 │  android/      │
         └────────────────────────────────►│  Tonight UI    │
              same official-15.json        └────────────────┘
```

---

## Build order (do not skip)

### Phase 1 — Catalog streaming metadata

**Goal:** TV can resolve how to open each title.

1. Add top-level `catalogVersion` to `data/official-15.json` (integer, bump when streaming fields change).
2. Add nested `streaming` object to every title:

```json
{
  "id": "loki-s1",
  "title": "Loki",
  "streaming": {
    "provider": "disney-plus",
    "contentId": null,
    "searchQuery": "Loki 2021 Disney+"
  }
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `provider` | yes | Enum: `disney-plus` (extend as needed) |
| `contentId` | no | Provider-specific ID for direct intent |
| `searchQuery` | yes | Fallback when `contentId` missing or intent fails |

3. Research and fill `contentId` for all 15 titles on Disney+ (verify X-Men titles — may differ).
4. Ensure deployed site serves `data/official-15.json` at a stable public URL for TV background refresh.

**Done when:** JSON validates; every title has `streaming`; `catalogVersion` is set.

---

### Phase 2 — Supabase backend

**Goal:** Pairing handshake + shared session state + realtime.

Create `supabase/` in repo root. Schema:

#### `sessions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | Session ID |
| `state` | jsonb | `runup.v1` shape (see below) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `pairing_codes`

| Column | Type | Notes |
|--------|------|-------|
| `code` | text PK | 6-digit string |
| `session_id` | uuid FK → sessions | |
| `expires_at` | timestamptz | ~10 minutes from creation |
| `created_at` | timestamptz | |

#### `devices`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `session_id` | uuid FK → sessions | |
| `device_token` | text unique | Issued on pair; TV stores in prefs |
| `label` | text | Optional, e.g. "Living room" |
| `paired_at` | timestamptz | |

#### State shape (`sessions.state`)

Same as web `localStorage` `runup.v1`:

```json
{
  "v": 1,
  "personaId": "after-endgame",
  "budgetHours": null,
  "watchedIds": [],
  "skippedIds": []
}
```

#### API surface (Edge Functions or RPC)

| Endpoint | Who calls | Behavior |
|----------|-----------|----------|
| `POST /pairing-code` | Web | Create or refresh 6-digit code for current session; return code + expires_at |
| `POST /pair` | TV | Body: `{ code, deviceLabel? }` → validate code, register device, return `{ sessionId, deviceToken }` |
| `GET /state` | Web, TV | Auth: `sessionId` + `deviceToken` (TV) or web session cookie/header |
| `PATCH /state` | Web, TV | Merge `watchedIds` / `skippedIds` as **set-union**; replace `personaId` / `budgetHours` on web placement change |
| `DELETE /devices/:id` | Web | Unpair one device |
| `DELETE /devices` | Web | Unpair all |

**Pairing rules:**

- Code is **reusable within TTL** — multiple TVs can pair with same code before expiry
- Code **expires** ~10 minutes after generation
- Pairing is **persistent** until explicit unpair
- Enable **Supabase Realtime** on `sessions` row updates

**Web session bootstrap:** On first visit, web creates a `sessions` row if none exists (store `sessionId` in `localStorage` alongside `runup.v1`, or embed in state).

**Done when:** Can pair via curl/Postman; state PATCH propagates; Realtime fires on update.

---

### Phase 3 — Web pairing UI

**Goal:** User gets a code from Watch tonight → On your TV.

Files to touch:

| File | Change |
|------|--------|
| `src/pairing.js` | New — Supabase client, create code, list devices, unpair |
| `src/TonightCard.jsx` | On your TV panel: code display, countdown, QR, device list, unpair |
| `src/watchTonight.js` | `TV_APP_URL` when Play Store listing exists |
| `.env.example` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

UI requirements:

- Show 6-digit code + QR encoding the code (or a `runup.app/pair?code=…` URL)
- Show expiry countdown; **Regenerate** button when expired
- List paired devices with unpair per device + "Unpair all"
- Keep existing install copy; add Play Store link when `TV_APP_URL` is set

Sync web `localStorage` ↔ Supabase:

- On load: if paired session exists, hydrate from Supabase (or merge local + remote with set-union)
- On `markAlreadySeen` / `markSkipped` / placement change: PATCH Supabase
- Subscribe to Realtime for cross-tab / post-TV-mark updates

**Done when:** Web shows live code; simulating TV pair via API updates device list; marking seen on web reflects in Supabase.

---

### Phase 4 — Android TV app scaffold

**Goal:** `android/` project builds and runs on Android TV emulator.

1. Create `android/` with Android Studio or `gradle init`:
   - Min SDK: 21+ (TV typical: 24+)
   - Target: Android TV (LEANBACK_LAUNCHER)
   - Jetpack Compose for TV
2. Package: `com.runup.tv` (or match your Play Console namespace)
3. Copy `data/official-15.json` into `android/app/src/main/assets/` at build time (Gradle task copying from repo root)
4. Add `INTERNET` permission

**Done when:** `./gradlew assembleDebug` succeeds; app launches on TV emulator showing placeholder.

---

### Phase 5 — Android pairing gate

**Goal:** Cold start → enter code → land on Tonight.

1. **PairingScreen** — 6-digit input (D-pad friendly), submit calls `POST /pair`
2. Store `sessionId` + `deviceToken` in `SharedPreferences`
3. If prefs exist, skip to Tonight
4. On 401 / session not found → clear prefs, show "Session ended — enter a new code from runup.app"

**Done when:** TV pairs with code from web; prefs survive app restart.

---

### Phase 6 — Android Tonight screen

**Goal:** Core couch experience.

Port queue logic from web (copy, don't share runtime):

| Web source | Android target |
|------------|----------------|
| `src/path.js` | `android/.../domain/RemainingQueue.kt` |
| `data/personas.json` | assets |
| `data/official-15.json` | assets + remote refresh |

**TonightScreen** shows:

- Poster (TMDB URL same pattern as `src/posters.js`)
- Title, year, runtime, `spoilerSafeWhy`
- **Open in provider** — primary CTA
- **Already seen** — PATCH state, set-union `watchedIds`
- **Skip** — PATCH state, set-union `skippedIds`

**Open in provider** launch order:

1. If `streaming.contentId` present → provider-specific intent (Disney+)
2. Else → `streaming.searchQuery` via `android.intent.action.SEARCH` / global search

**Path complete:** When `remainingQueue` is empty, show celebration copy from web empty Tonight card + days to horizon (`horizon` in catalog).

**Realtime:** Subscribe to session row; recompute Tonight on change.

**Catalog refresh:** On launch, fetch remote `official-15.json`; if `catalogVersion` > bundled, replace cache.

**Done when:** Full loop works on emulator — pair, open provider intent fires, Already seen updates web.

---

### Phase 7 — Polish & ship prep

- [ ] Error states: network offline, expired code, provider not installed
- [ ] TV focus order and talkback labels
- [ ] Play Store listing stub → set `TV_APP_URL`
- [ ] README section for Android build + Supabase setup
- [ ] Manual test on physical Android TV / Google TV device

---

## Verification checklist

| # | Test | Expected |
|---|------|----------|
| 1 | Fresh TV install | Pairing gate only; no placement |
| 2 | Enter code from web | TV shows Tonight matching web head |
| 3 | Open in provider | Disney+ or search fallback opens |
| 4 | Already seen on TV | Title leaves queue on web (realtime) |
| 5 | Skip on TV | Title gone from strand on web; not in watchedIds |
| 6 | Pair second TV with same code (within 10 min) | Both show same Tonight |
| 7 | Unpair on web | TV shows re-pair message on next open |
| 8 | Empty queue | TV shows path complete |
| 9 | Change placement on web | TV Tonight updates via realtime |
| 10 | Catalog version bump remote | TV picks up new streaming data without APK update |

---

## Out of scope (do not build)

- Threadfield on TV
- Standalone TV placement
- Google account / household sync
- JustWatch or runtime availability APIs
- iOS / App Store
- 166-title catalog

---

## Key files reference (existing)

| File | Role |
|------|------|
| `src/TonightCard.jsx` | On your TV panel — extend for pairing |
| `src/watchTonight.js` | `TV_APP_URL`, search URL helpers |
| `src/storage.js` | `runup.v1` shape, mark actions |
| `src/path.js` | `remainingQueue()` — port to Kotlin |
| `data/official-15.json` | Add `streaming` + `catalogVersion` |
| `data/personas.json` | Persona seed data for queue math |

---

## Suggested branch

```bash
git checkout -b cursor/slice-7-google-tv
```

---

## Environment variables

### Web (`.env`)

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ENABLE_POSTERS=true
```

### Android (`local.properties` or `BuildConfig`)

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
CATALOG_URL=https://your-deployed-runup.app/data/official-15.json
```

Use Row Level Security on Supabase so devices can only read/write their own session.
