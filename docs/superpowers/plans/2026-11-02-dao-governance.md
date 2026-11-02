# Dao Governance Implementation Plan

Goal: Extend v2.0.13 without deleting existing crafting specializations; add coherent craft/food specializations, formations and leadership paths, and repair path-selection crowding.
Architecture: Existing data expansion registration, no new script tags or locked core edits. Shared skills remain cross-path; save-compatible IDs and bounded runtime effects.
Tech: Plain JavaScript; existing Node regression harness and single HTML builder.

- [x] Import the user-provided v2.0.13 baseline from origin/Gemini ZIP.
- [x] Extend crafting with differentiated food/armor specializations and real practiced-skill outcomes.
- [x] Add formation/talisman and strategy/governance major paths with names, techniques, progression and bounded gameplay hooks.
- [x] Remove top-six-subpath crowding from major path choice; test real trait preferences and seeded distributions for every path.
- [x] Schema audit, build, regression suites, runtime/save tests and report; preserve old paths, IDs and unlocked investments.
