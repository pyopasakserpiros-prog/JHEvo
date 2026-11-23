# Patch Report — JS2 v3.6.0c (Deep Living World Audit, Realism Calibration & Cross-System Sync)

**Release Date**: 2026-11-19  
**Patch Version**: `3.6.0c`  
**Save Schema**: `3.6.0c-living-world-audit` (100% backward-compatible with `3.6.0b`, `3.6.0a`, `3.5.0c`–`3.0.0`)

## 1. Deep Audit Findings & Root Causes Resolved
1. **P1 — Coup Storm / Dynasty Explosion (`EXPED.LIVING_POLITIES`)**:
   - *Before (`v3.6.0b`)*: 20-year 5-seed soak averaged `75.8` coups/20yr (`dynastyMax = 36`) because uncapped `overext` crashed legitimacy in 3 months with no coup cooldown.
   - *Fix*: Added `lp.lastCoupDay` 2-year (`720`-day) per-polity cooldown, capped `overext` at `2.4`, tuned coup trigger (`legitimacy <= 22`, chance `0.16`, restores legitimacy to `64`).
   - *After (`v3.6.0c`)*: `16.4` coups/20yr (`dynastyMax = 8`) — dramatic yet historically believable.
2. **P1 — Border-War Snowball & City Ping-Pong (`EXPED.LIVING_POLITIES`)**:
   - *Before (`v3.6.0b`)*: `78.0` border conquests/20yr with empires snowballing up to `37/54` cities.
   - *Fix*: Calibrated monthly trigger (`0.36` → `0.18`), added `state.cityLastShiftDay` 1.5-year (`540`-day) per-city cooldown, imperial garrison overstretch penalty (`cityCount > 9`), small-kingdom homeland defense (`+14`), and ancestral city reclamation morale (`+10`).
   - *After (`v3.6.0c`)*: `36.4` conquests/20yr, `maxCities = 25`, `5` distinct Imperial Hegemons across 5 seeds.
3. **P1 — Stale Static `city.polityId` in `EXPED.tickContinentalCourts`**:
   - *Fix*: Updated court town stability/prosperity, border diplomatic pair detection, and `courtEvent` `storyThreadId` to read live `state.cityOwners[city.id]`.
4. **P1 — Stale Static `node.polityId` in Observer UI & World Atlas Map (`GAME_SOURCE/js/ui.js`)**:
   - *Fix*: World Atlas settlement marker color (`--polity-color`), settlement inspector (`atlasCityInfo`, now showing `(เดิมสังกัด...)` provenance tag when conquered), and `UI.rPolities` diplomacy feed now all read `EXPED.LIVING_POLITIES.ownerOf(W, id)` live.
5. **P1 — Deposed Ruler Cleanup & Chronicle Thread Wiring**:
   - *Fix*: Coups now cleanly remove deposed ruler figures from `state.figures`, set the new ruler's `residenceId`, and tag `LIVING_POLITIES.recordEvent` with `storyThreadId: 'court:' + polityId`.

## 2. Verification Summary
- `living_world_audit_v360c_suite.js`: **6/6 PASS**
- `living_polities_v360b_suite.js`: **5/5 PASS**
- `living_sects_v360a_suite.js`: **5/5 PASS**
- `full_release_audit_and_behavior_suite.js`: **6/6 PASS**
- `core_lock.js` & `validate_data_schema.js`: **PASS** (`Errors: 0, Warnings: 0`)
- `run_parallel_tests.js`: **187/187 PASS** (`0` fail, `0` timeout)
- Protected SHA-256 Locks (`AGENTS.md`, `GAME_SOURCE/js/human_core.js`): **100% Untouched**
