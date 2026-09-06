# Runup

Unofficial, spoiler-safe catch-up for *Avengers: Doomsday* (18 Dec 2026).  
**Not affiliated with Marvel Entertainment or The Walt Disney Company.**

This repo was started as a local git project. There is no GitHub remote yet from the cloud agent (no `gh` login).

## Create the GitHub repo (on your machine)

```bash
cd runup   # this project
gh auth login
gh repo create runup --public --source=. --remote=origin --push
```

Or create an empty repo on github.com, then:

```bash
git remote add origin git@github.com:YOUR_USER/runup.git
git push -u origin main
```

Then open that repo in Cursor if you want an agent to keep building.

## Run locally

```bash
git clone https://github.com/franferns/runup.git
cd runup
git checkout cursor/nextjs-discoverability
npm install
cp .env.example .env   # add Supabase keys if using TV pairing
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public landing page. The interactive app lives at `/app`.

Build order (slices, files, done-when): **[IMPLEMENTATION.md](IMPLEMENTATION.md)**.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Public landing (SSG, indexable) |
| `/official-15` | Official 15 watch-order page (SSG, indexable) |
| `/app` | Void / Threadfield (interactive) |
| `/app/list` | List view |
| `/design` | Design gallery (dev, noindex) |
| `/pair?code=…` | TV pairing deep-link (noindex) |

Legacy `/list` redirects to `/app/list`.

## Slice 7 — Google TV + pairing

- **Web pairing:** set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env` (see `.env.example`). Watch tonight → On your TV shows a live code, QR, and device list.
- **Supabase:** migrations + edge functions in [`supabase/`](supabase/). See [`supabase/README.md`](supabase/README.md).
- **Android TV app:** [`android/`](android/). See [`android/README.md`](android/README.md).
- **Catalog:** `data/official-15.json` includes `catalogVersion` and per-title `streaming` metadata; copied to `public/data/` on build for TV refresh.

## Scripts

```bash
npm run dev          # Next.js dev server (:3000)
npm run build        # catalog:public + catalog:md + next build
npm run start        # Serve production build
npm run catalog:public   # copy data/official-15.json → public/data/
npm run catalog:md       # regenerate content/official-15.md from JSON
npm run icons
npm run backgrounds
```

## SEO content pipeline

Public copy for `/official-15` lives in [`content/official-15.md`](content/official-15.md). The interactive app still reads [`data/official-15.json`](data/official-15.json).

**When the catalog changes:**

1. Edit `data/official-15.json`
2. Run `npm run catalog:md` (or `npm run build`, which runs it automatically)
3. Review `content/official-15.md` — re-apply any hand-edited intro paragraphs if the script overwrote them
4. Deploy with `NEXT_PUBLIC_SITE_URL` set to your production URL

**Verify locally:**

```bash
npm run build && npm run start
curl -s http://localhost:3000/official-15 | grep "X-Men"   # should match
curl -s http://localhost:3000/sitemap.xml                  # lists / and /official-15
curl -s http://localhost:3000/robots.txt                   # Disallow: /app/
```

Discoverability plan: [`docs/plans/nextjs-discoverability.md`](docs/plans/nextjs-discoverability.md).

## What’s here

- Public landing and `/official-15` SEO pages (server-rendered HTML)
- Interactive catch-up tool at `/app`
- Design mockups at `/design` (`public/mocks/`)
- [`data/official-15.json`](data/official-15.json) — Disney+ homework list as reported in press, with spoiler-safe blurbs

## Next

Follow [IMPLEMENTATION.md](IMPLEMENTATION.md). Do not start with Three.js or a 166-title catalog.
