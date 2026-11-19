# START HERE FOR AI — JianghuSect Evolution (JS2 v3.8.3)

## Current State
- **Active Version**: **JS2 v3.8.3 Grand Lore Chronicles (11 Books) & New-Chat Handoff** (`SIM.PATCH_VERSION = '3.8.3'`, `SIM.SAVE_SCHEMA_VERSION = '3.8.3-grand-lore-chronicles-11books'`).
- **Completed Series**: `v3.1.0` Living Lore → `v3.2.0` Equipment Expansion → `v3.3.0` Tactical Combat & Six-Path Mastery → `v3.4.0` External World Events → `v3.5.0a/b/c` Complete P0/P1/P2 Hardening → `v3.6.0a/b/c` Living Sects & Continental Polities → `v3.7.0/a/b/c` Legendary & Transcendent Dao Expansion (`55` Paths / `346` Subpaths) → `v3.8.0` Master Lore Compendium & Era Lore Window → `v3.8.1` Formal World Calendar (`ยุคที่ 101 ปีที่ 1`) → `v3.8.2` Era 0–1 Chaos Lore Archive → `v3.8.3` 11-Book Grand Lore Chronicles (`GAME_SOURCE/data/lore_chronicle_*.js`, synced into `data_expansion.js`) & `📚 คลังมหากาพย์ 11 บท` (`UI.rLore()`).
- **Full Changelog & Handoff**: See `CHANGELOG_JS2_V310_TO_V383.md`, `docs/handovers/NEW_CHAT_HANDOFF_JS2_v3.8.3.md`, and `PATCH_REPORTS/` (intermediate changelogs `v3.6.0b–v3.8.2` archived in `PATCH_REPORTS/changelogs/`).

## Non-Negotiable Invariants (`AGENTS.md`)
1. **Never modify `AGENTS.md`** (`67,202` bytes) or **`GAME_SOURCE/js/human_core.js`** (`HC.FINGERPRINT === '155:2f9c9dd7'`).
2. **Exact 40 `<script>` tags** across `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html`.
3. **100% Autonomous NPCs** — zero player command buttons.
4. **Always run** `core_lock.js`, `validate_data_schema.js`, `lore_grand_chronicles_v383_suite.js`, `lore_chaos_era_v382_suite.js`, `world_calendar_v381_suite.js`, `lore_compendium_v380_suite.js`, `p2_polish_v370c_suite.js`, `legendary_dao_v370_suite.js`, `living_world_audit_v360c_suite.js`, `living_polities_v360b_suite.js`, `living_sects_v360a_suite.js`, `p2_polish_v350c_suite.js`, `build_single.js`, and `run_parallel_tests.js` after changes.
