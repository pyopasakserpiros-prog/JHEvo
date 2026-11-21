# START HERE FOR AI — JianghuSect Evolution (JS2 v3.8.6)

## Current State
- **Active Version**: **JS2 v3.8.6 90-Book Grand Lore Archive & Deep Continuity Audit** (`SIM.PATCH_VERSION = '3.8.6'`, `SIM.SAVE_SCHEMA_VERSION = '3.8.6-90book-grand-lore-archive'`).
- **Completed Series**: `v3.1.0`–`v3.7.0c` Core Systems & Living World → `v3.8.0–v3.8.4` Master Lore Compendium, 1,000-Year Epoch Calendar, & 44-Book Archive → `v3.8.5` Lore Continuity & Canon Hardening (`LC-01..LC-15`) → **`v3.8.6` 90-Book Grand Lore Archive (`7.25 MB`, `2,256` Entity IDs, 100% Epoch 1–101 coverage, `22,831 KB` single-file HTML)**.
- **Handoff & Reports**: See `PATCH_REPORTS/PATCH_v3.8.6_90BOOK_GRAND_LORE_ARCHIVE.md`, `PATCH_REPORTS/PATCH_REPORT_JS2_v3.8.5.md`, `docs/handovers/NEW_CHAT_HANDOFF_JS2_v3.8.5.md`, and `CHANGELOG_JS2_V310_TO_V383.md`.

## Non-Negotiable Invariants (`AGENTS.md`)
1. **Never modify `AGENTS.md`** (`67,202` bytes) or **`GAME_SOURCE/js/human_core.js`** (`HC.FINGERPRINT === '155:2f9c9dd7'`).
2. **Exact 40 `<script>` tags** across `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html`.
3. **100% Autonomous NPCs** — zero player command buttons.
4. **Always run** `core_lock.js`, `validate_data_schema.js`, `lore_grand_chronicles_v383_suite.js`, `lore_chaos_era_v382_suite.js`, `world_calendar_v381_suite.js`, `lore_compendium_v380_suite.js`, `p2_polish_v370c_suite.js`, `legendary_dao_v370_suite.js`, `living_world_audit_v360c_suite.js`, `living_polities_v360b_suite.js`, `living_sects_v360a_suite.js`, `p2_polish_v350c_suite.js`, `build_single.js`, and `run_parallel_tests.js` after changes.
