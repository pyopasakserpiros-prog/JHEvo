# Legendary Visual Identity Implementation Plan

> Native execution by Codex, explicitly authorized by user; no further design approval required.

**Goal:** Distinct legendary arts and relics with authored themes and real-event activation.
**Architecture:** Extend render.js catalogs and renderer-only event queue. Keep combat/stat logic unchanged, consume existing castFx and lastWeaponProc.
**Tech Stack:** JavaScript, Canvas 2D, Node, system Chromium/CDP.
**Spec:** ../specs/2026-11-09-legendary-visuals-design.md

## Global Constraints
- human_core.js byte identical; no script-order changes; Thai player-facing text.
- Visuals must not mutate W or use simulation RNG; preserve current version/schema.

## Review Focus
- Legendary + signature dispatch must retain authored motif.
- Ordinary T7 and unusable/unequipped relics must not get legendary presentation.
- Same-id equipment metadata edits must invalidate appearance.
- Pause/load/despawn must not replay or leak proc events.
- Low/reduced-motion effects retain identities and balanced Canvas stacks.

### Task 1: Arts and relic presentation
- [x] Catalog all existing legendary arts and 27 authored relics in render.js.
- [x] Implement drawLegendaryArtVfx, drawLegendaryRelicGlyph, drawLegendaryEquipmentAura.
- [x] Complete silhouettes and suppress generic overpainting only for supported authored weapons.
- [x] Consume lastWeaponProc in updateCastEffects, baseline on setWorld, preserve bounded lifecycle.
- [x] Test coverage, uniqueness, gating, real events, pause/load, purity and context balance in legendary_visual_identity_suite.js.

### Task 2: Verify and hand off
- [x] Register suite, schema check, targeted regressions and full runner.
- [x] Rebuild single HTML, compare screenshots on desktop/mobile and standalone.
- [x] Update project status, relevant project skills, README and patch report; retain next-patch assignment.
- [x] Fetch latest main, commit and fast-forward push HEAD:main, verify remote commit.

Validation outcome: 143/144 full-run groups PASS, startup_ui pre-existing pointer interception timeout reproduced on e048b5f; project CDP fallback passes seven startup scenarios. See patch report for exact limits.
