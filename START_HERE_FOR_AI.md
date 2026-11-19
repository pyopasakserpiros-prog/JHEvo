# START HERE FOR AI — JianghuSect Evolution (JS2 v3.5.0c)

## Current State
- **Active Version**: **JS2 v3.5.0c Complete Stabilization & GitHub Release** (`SIM.PATCH_VERSION = '3.5.0c'`, `SIM.SAVE_SCHEMA_VERSION = '3.5.0c-release-polish'`).
- **Completed Series**: `v3.1.0` Living Lore → `v3.2.0` Equipment Expansion → `v3.3.0` Tactical Combat & Six-Path Mastery → `v3.4.0` External World Events → `v3.5.0a` Phase A P0 Hardening (13 P0s) → `v3.5.0b` Phase B P1 Live-Loop Wiring & UI Sync → `v3.5.0c` Phase C P2 Polish & Release Bundle.
- **Full Changelog**: See `CHANGELOG_JS2_V310_TO_V350C.md` and `PATCH_REPORTS/`.
- **Next Patch Candidate (`v3.6.0`)**: See `docs/handovers/JS2_V3_6_0_NEXT_PATCH_HANDOFF.md`.

## Non-Negotiable Invariants (`AGENTS.md`)
1. **Never modify `AGENTS.md`** (`67,202` bytes) or **`GAME_SOURCE/js/human_core.js`** (`HC.FINGERPRINT === '155:2f9c9dd7'`).
2. **Exact 40 `<script>` tags** across `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html`.
3. **100% Autonomous NPCs** — zero player command buttons.
4. **Always run** `core_lock.js`, `validate_data_schema.js`, `p2_polish_v350c_suite.js`, `p1_hardening_v350b_suite.js`, `p0_hardening_v350a_suite.js`, `world_events_v340_suite.js`, `tactical_sixpaths_v330_suite.js`, `equipment_v320_suite.js`, `build_single.js`, and `run_parallel_tests.js` (`187/187 PASS`) after changes.
