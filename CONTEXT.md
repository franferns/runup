# Runup

Unofficial catch-up guide for *Avengers: Doomsday* (18 Dec 2026). Helps a viewer find the shortest remaining watch path, spoiler-safe, given what they have already seen and how much time they have left.

## Language

**Placement**:
The user's answer to "where am I?" — chosen once (or changed later) from the four pins on the placement screen. The fourth pin ("I have 8 hours total") is a combo shortcut: sets `personaId: "official-15"` and `budgetHours: 8`.
_Avoid_: Onboarding, setup, lane selection

**Persona**:
A preset that seeds which titles are treated as already watched via `treatAsWatched` (a list of title ids). Three personas: `after-endgame` (`treatAsWatched`: Cap through Endgame), `x-men-lane` (`treatAsWatched`: `x-men-2000`, `x2-2003`), `official-15` (empty list). Persona logic uses only `treatAsWatched` — catalog flags like `typicallyBeforeEndgame` are metadata for editors, not runtime queue rules. Changing persona resets `watchedIds`, `skippedIds`, and `budgetHours` (unless the new placement sets a budget). Requires a confirm dialog before reset: "Change starting point? This resets your watched and skipped titles."
_Avoid_: Profile, track, lane

**Time budget**:
An optional cap on total runtime (in hours) of the remaining queue. Stored as `budgetHours`. Orthogonal to persona — not a fourth persona. Applied last: after persona seeding and user marks, walk catalog `order` from the front and keep titles until the next one would exceed the budget (head-keep); drop everything after.
_Avoid_: Eight-hours persona, time limit persona, tail-shed

**Remaining queue**:
The ordered list of titles still to watch — Official 15 in `order`, minus persona `treatAsWatched`, minus user `watchedIds`, minus `skippedIds`, then optionally truncated by `budgetHours`.
_Avoid_: Remaining path, watchlist, checklist

**Tonight**:
The title at index 0 of the remaining queue — the one the app surfaces on the Tonight card and highlights on the Threadfield.
_Avoid_: Next up, current title, head

**Already seen**:
User action meaning "I have watched this." Adds the title id to `watchedIds`, removes it from the remaining queue permanently, and marks the node bright on the Threadfield.
_Avoid_: Watched, done, completed

**Skip**:
User action meaning "not tonight, and I'm not claiming I've seen it." Adds the title id to `skippedIds`, removes it from the remaining queue, and removes the node from the Threadfield entirely (not shown as watched).
_Avoid_: Pass, defer, later

**Watch tonight**:
User action meaning "this is my pick for now." Does not dequeue or change watched/skipped state — the title stays at the head until the user later marks it Already seen (or Skips it). **Web (v0):** expands the Tonight card inline with (1) a Google search link for the title and (2) TV install guidance (QR / Play Store link to the Google TV companion app). **Google TV app (post-v0):** deep-link to the title on the user's OTT provider (e.g. Disney+).
_Avoid_: Start watching, play

**Void**:
The first screen — dark landing with placement pins. Lives at `/`. Replaces the current mock-only hero once Slice 1 ships.
_Avoid_: Landing page, home

**Threadfield**:
The 2.5D strand visualization of the remaining queue toward the horizon. Default main view after placement (when motion is allowed). Nodes represent remaining titles only — strand length is progress. Tonight's node is selected (highlighted). On Already seen: line-draw animation to the next node, then the completed node is removed. No persistent bright watched nodes.
_Avoid_: Field, 3D view, canvas

**Design gallery**:
The Screens mock reference (`runup-01` … `05`). Lives at `/design` after Slice 1; not part of the user flow.
_Avoid_: Mocks page, screens

**Google TV app**:
A post-v0 Android TV companion that opens Tonight's title directly in the user's OTT provider. Not in v0 scope; web v0 includes install guidance pointing to it.
_Avoid_: TV app, Android TV build

**Pace warning**:
A calm alert when remaining queue hours divided by calendar days to the horizon exceeds the pace threshold (~2h/day). Tells the user they cannot watch everything at a sustainable daily rate.
_Avoid_: Overtime alert, crunch mode

**Fit to pace**:
User action triggered from the pace warning. Sets `budgetHours` to `daysLeft × 2` and reapplies head-keep on the remaining queue. v0 label; replaces the plan's "Shed to Official 15 only" until a wider catalog exists.
_Avoid_: Shed, trim queue, auto-budget

**List view**:
An ordered text list of the remaining queue at `/list`. Default view after placement when `prefers-reduced-motion: reduce` is set. Threadfield remains reachable via a link, without motion effects.
_Avoid_: Fallback, a11y mode, checklist view

**Horizon**:
The fixed release date for *Avengers: Doomsday* — 18 Dec 2026. The app counts calendar days remaining toward it.
_Avoid_: Deadline, target date
