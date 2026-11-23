# JS2-v2.6.0 main refinement — 15 new skill Signature VFX

**Base commit:** `01061d32f1ea9967d7717bcb4fab8803b13bf5ee` (`feat(vfx): expand weapon motion and combat target effects`)
**Game runtime/save schema:** unchanged (`2.6.0` / `2.6.0-living-chronicle-and-reporting`)
**Implementation date:** 2026-11-09

Expanded the Signature skill catalog from 30 to **45 distinct Canvas forms** by adding effects to 15 real techniques across XIAN, BODY, GOD, HEART_SOUL, BEAST_SOVEREIGN, SPIRIT_HUSBANDRY, and ARENA_GLORY. Selection began with an audit of actual catalog IDs and `SK.resolveSignatureVfx`: all 15 techniques had no explicit signature or resolver fallback on the v2.6.0 base. Both selected three-stage technique families also had no pre-existing effect on any of their six individual move stages.

The art choices follow the named mechanic: bending bamboo returns with leaf-blade arcs; magnetic force pulls four weapon silhouettes into a core; iron-rhino armor drives a horn-first rush; an eight-direction stomp cracks the ground without reusing the existing giant palm; twin hammers strike a visible anvil; a small divine bell interrupts with sound crescents rather than a protective dome; a stone tortoise braces on four legs; a faith web links real recipients; a landscape scroll unrolls to reveal mountains and a river; seven dream masks orbit; one mind blade follows a focused line; a beast pack closes a hunting ring; Gu insects form a winged spiral rather than serpents; thorn vines cinch a target; and arena stands project a crowd roar.

The existing combat targeting pipeline remains authoritative. The signature VFX appears at the actual event anchor, existing markers continue to show resolved multi-target recipients and teams, and the faith-network motif additionally connects only the coordinates captured in `castFx.targetPoints`. Persistent self/ally status auras remain on the existing owner-bound renderer. All shapes are render-only: no combat result, simulation RNG, world serialization, or save-schema fields were changed. Reduced Motion freezes decorative motion, while the shared queue remains capped at 24 active entries.

The complete assignment list, prior-effect audit, target behavior, and no-duplicate guidance are in the [Skill VFX Assignment Registry](../docs/audits/SKILL_VFX_ASSIGNMENT_REGISTRY.md). The [45-form gallery](../docs/visuals/skill-vfx-expansion/skill-vfx-gallery.png) preserves the 30 existing shapes followed by the 15 additions; a [magnified faith-network recipient preview](../docs/visuals/skill-vfx-expansion/faith-network-recipient-links.png) shows links to actual combat points.

## Validation

- `node GAME_SOURCE/test/skill_vfx_expansion_suite.js` — **PASS**: 15 exact assignments, unique IDs/shapes, parent and move-stage no-duplicate baseline audit, all 15 real combat cast snapshots, and a friendly multi-recipient faith-link cast.
- `node GAME_SOURCE/test/signature_vfx_catalog_browser_audit.js` — **PASS**: all 45 Signature forms and 43 path crowns produce distinct Canvas pixels; additional-recipient coordinates change the faith-network drawing; no browser page errors.
- `node GAME_SOURCE/tools/validate_data_schema.js` — **PASS**: 0 errors / 0 warnings (1,177 items, 1,402 recipes, 286 subpaths, 1,243 techniques, 1,245 effects).
- `cd GAME_SOURCE && node tools/build_single.js` — **PASS**: rebuilt standalone game, 16,217 KB. `SIM.PATCH_VERSION` / save schema unchanged; `HC.FINGERPRINT` remains `155:2f9c9dd7`, `human_core.js` matches the base commit, and 40 script tags remain in order.
- `node GAME_SOURCE/tools/run_parallel_tests.js` — **150/152 groups passed** (151 suites plus syntax across 229 JavaScript files). `startup_ui` timed out because startup-overlay content intercepts Playwright clicks. The 8× `browser_mobile_perf` run sampled 18.73 pending ticks against `<16`; its isolated retry passed at 1.4 ms/tick / 178.6× cap. This is a test-environment variance, not reproduced by the VFX-specific or isolated mobile-performance checks.
- The v2.5 path/signature regression and v5.3 signature regression both passed after updating their fixed catalog-count assertions from 30 to 45; legendary visual browser checks passed at desktop and mobile widths.
