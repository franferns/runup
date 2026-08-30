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
git checkout cursor/include-mock-screens-9b39
npm install
npm run dev
```

Build order (slices, files, done-when): **[IMPLEMENTATION.md](IMPLEMENTATION.md)**.

## What’s here

- Void landing screen (static stand-in for the Threadfield)
- Design mockups on the home page (`public/mocks/`)
- [`data/official-15.json`](data/official-15.json) — Disney+ homework list as reported in press, with spoiler-safe blurbs

## Next

Follow [IMPLEMENTATION.md](IMPLEMENTATION.md). Do not start with Three.js or a 166-title catalog.
