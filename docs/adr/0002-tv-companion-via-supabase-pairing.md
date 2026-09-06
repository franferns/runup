# Google TV companion via Supabase pairing

Slice 7 is a native Kotlin + Compose for TV app in `android/` (monorepo) that shows **Tonight only** after pairing — not a Threadfield port. Web owns placement; the TV app is a couch remote for an already-configured queue.

State sync uses **Supabase** (Postgres + Realtime): the web app shows a short-lived pairing code in the Watch tonight → On your TV panel; the TV enters it once and stays paired until explicit unpair. Bidirectional writes merge `watchedIds` and `skippedIds` as set-union; multiple TVs can share one session. Catalog titles carry a nested `streaming` object for per-title OTT launch.

**Considered:** Standalone TV placement (rejected — two sources of truth); read-only TV sync (rejected — breaks couch Already seen); Firebase (rejected — relational pairing schema fits Postgres better); React Native for TV (rejected — deep links and 10-foot UI are native concerns; queue math is trivial to port).
