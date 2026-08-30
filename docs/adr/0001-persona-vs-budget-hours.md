# Persona and time budget are separate fields

Placement offers four pins, but only three are **personas** (`after-endgame`, `x-men-lane`, `official-15`). Time constraint is a separate `budgetHours` field applied after persona seeding and user marks (head-keep in catalog `order`).

We rejected making `eight-hours` a fourth persona because a budget is orthogonal to "where am I?" — the same persona can be trimmed to fit available hours. The fourth pin is a combo shortcut: `personaId: "official-15"` + `budgetHours: 8`.

**Considered:** Four equal personas with special-case logic in `path.js` for `eight-hours`.
