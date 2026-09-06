# Runup Google TV companion

Kotlin + Jetpack Compose for TV. Shows **Tonight only** after pairing — no placement on TV.

## Prerequisites

- Android Studio Ladybug+ with Android TV system image
- `ANDROID_HOME` set
- Supabase project deployed (see [`supabase/README.md`](../supabase/README.md))

## Configure

Copy `local.properties.example` to `local.properties` and set:

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
CATALOG_URL=https://your-runup-deploy/data/official-15.json
```

Gradle reads these via `app/build.gradle.kts` `buildConfigField`.

## Build

```bash
cd android
./gradlew assembleDebug
```

Catalog assets are copied from `../data/` on each build (`copyCatalogAssets` task).

## Run on TV emulator

1. Create an Android TV (1080p) AVD in Device Manager.
2. Install: `./gradlew installDebug`
3. Pair with the 6-digit code from the web app (Watch tonight → On your TV).

## Flow

1. **Pairing gate** — enter code from web
2. **Tonight** — poster, title, Open in provider / Already seen / Skip
3. **Path complete** — when queue is empty
4. State syncs via Supabase edge functions; polls every 15s while paired

Disney+ deep links use `streaming.contentId` from `official-15.json`; falls back to global search.
