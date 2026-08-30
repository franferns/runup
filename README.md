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
npm install
npm run dev
```

## What’s here

- Void landing screen (static stand-in for the Threadfield)
- Design mockups on the home page (`public/mocks/`)
- [`data/official-15.json`](data/official-15.json) — Disney+ homework list as reported in press, with spoiler-safe blurbs

## Next implementation slice

1. Placement: four pins (Endgame-stoppers, X-Men lane, Official 15, 8 hours)
2. Remaining path from “stopped after Endgame”
3. Tonight card (Already seen / Watch / Skip)
4. Line-draw on mark-watched
5. `prefers-reduced-motion` + list fallback
