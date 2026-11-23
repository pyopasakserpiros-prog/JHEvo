# Patch Report: JS2 v3.7.0c — Phase C: Final P2 Polish & Full 192-Suite Parallel Regression Lock

- **Version**: `SIM.PATCH_VERSION = '3.7.0c'`
- **Save Schema**: `SIM.SAVE_SCHEMA_VERSION = '3.7.0c-final-polish'` (fully backward-compatible with `3.7.0b-p1-realism-polish`, `3.7.0a-p0-audit-fixes`, `3.7.0-legendary-dao`, `3.6.0c-living-world-audit`, and all prior schemas)
- **Protected Locks**:
  - `AGENTS.md`: `67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4` (untouched)
  - `GAME_SOURCE/js/human_core.js`: `HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (untouched)
  - Script Tags: Exact `40` `<script>` tags preserved across `index.html`, `test/load.js`, and `JianghuSect_single.html`.

## Summary of Phase C (`JS2 v3.7.0c`) Improvements & Regression Fixes
1. **55/55 Full Tier-7 Legendary Apex Technique Parity (`GAME_SOURCE/data/data_martial.js`)**:
   - Added 12 canonical Tier-7 Apex Techniques (`LEG_V370_<PATH>`, `apexPathArt: true`, `v370c: true`) — one for each of the 6 Legendary and 6 Transcendent Daos introduced in `v3.7.0`, each mapped to its canonical first subpath, weapon class, element, and `KW_DAO_*` signature keyword.
   - Dedicated support apexes (`LEG_V370_LEG_TRIAGE_MERIDIAN` and `LEG_V370_TRANS_CONSTELLATION_RELAY`) carry real `heal` / `harmonize` `moveDefs` (`heal: 0.28 / 0.24`, `shield: 0.12 / 0.18`, `team: true` on relay).
2. **Memoized `ECO.base(id)` & Tier-Scoped Recipe Price Floor (`GAME_SOURCE/js/economy.js`)**:
   - Added O(1) `_baseValCache` memoization in `ECO.base(id)`, cutting 80-NPC simulation tick overhead back below the `<= 3.5 ms/tick` performance budget (`3.34 ms/tick`).
   - Scoped the `>= 1.15x` input-cost price floor to `Tier >= 4` recipes so high-tier pills (`T4–T7`, e.g. T6 heal pills `>= 5,000`) maintain realistic craft margins while T1–T3 basic pills stay affordable (`<= 40 CP`) for outer/inner disciples.
3. **`GRAVE_CORPSE_DETONATE` Corpse-Scaled Damage Cap (`GAME_SOURCE/js/combat.js`)**:
   - Fixed the `Math.min(Math.max(...))` parenthesis typo and scaled the Stage 7+ anti-one-shot cap by consumed corpses (`0.14 + usedCorpses * 0.04`, max `0.22 * stageRefHp`) so detonating corpses always deals strictly more damage than 0 corpses without breaking Stage 7+ combat pacing.
4. **Full Parallel Regression Suite Registration (`GAME_SOURCE/test/run_all.js`, `GAME_SOURCE/test/p2_polish_v370c_suite.js`)**:
   - Added `p2_polish_v370c_suite.js` (5/5 PASS) and registered `living_world_audit_v360c_suite`, `legendary_dao_v370_suite`, `p0_audit_v370a_suite`, `p1_realism_v370b_suite`, and `p2_polish_v370c_suite` into `run_all.js` so `run_parallel_tests.js` executes all **192** test suites (Node + Playwright browser suites) plus full JS syntax sweep (`280` files).
