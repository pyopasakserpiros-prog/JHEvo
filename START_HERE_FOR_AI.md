> **[ACTIVE RELEASE BASE: JS2 v3.9.5 — 104 Lore Books + Living Institutions + Reincarnated Witnesses + 12 Rift-Shard Realms]**
> **Next Active Patch Assignment (Phase 2 of 3):** Read `docs/handovers/ACTIVE_PATCH_PROMPT_V3_9_4.md` and `MASTER_LORE_BIBLE.md` before starting work.

> **Latest Release: `JS2 v3.8.5`** — Lore Continuity & Canon Hardening (resolved all 15 audit findings `LC-01..LC-15` + 3 worldbuilding decisions across runtime `sim.js`/`sect.js`/`expedition.js`/`visitors_clues.js` and 44 bundled Lore Chronicles), verified 40-script lock & `JianghuSect_single.html` (`21,261 KB`). See `NEW_CHAT_HANDOFF_JS2_v3.8.5.md` & `PATCH_REPORTS/PATCH_REPORT_JS2_v3.8.5.md`.

# START HERE FOR AI — JianghuSect Evolution (JS2 v3.8.5)

## Current State
- **Active Version**: **JS2 v3.8.5 Lore Continuity & Canon Hardening** (`SIM.PATCH_VERSION = '3.8.5'`, `SIM.SAVE_SCHEMA_VERSION = '3.8.5-lore-continuity-canon-hardening'`).
- **Completed Series**: `v3.1.0`–`v3.7.0c` Core Systems & Living World → `v3.8.0–v3.8.4` Master Lore Compendium, 1,000-Year Epoch Calendar, & 44-Book Standalone Lore Archive → **`v3.8.5` Lore Continuity & Canon Hardening (`LC-01..LC-15`)**.
- **Handoff & Reports**: See `NEW_CHAT_HANDOFF_JS2_v3.8.5.md` and `PATCH_REPORTS/PATCH_REPORT_JS2_v3.8.5.md`.

## Non-Negotiable Invariants (`AGENTS.md`)
1. **Never modify `AGENTS.md`** (`67,202` bytes) or **`GAME_SOURCE/js/human_core.js`** (`HC.FINGERPRINT === '155:2f9c9dd7'`).
2. **Exact 40 `<script>` tags** across `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html`.
3. **100% Autonomous NPCs** — zero player command buttons.
4. **Always run** `sync_lore_bundle.js` (when editing `lore_chronicle_*.js`), `core_lock.js`, `validate_data_schema.js`, `lore_44books_v384_suite.js`, `lore_continuity_v385_suite.js`, `save_integrity.js`, `full_release_audit_and_behavior_suite.js`, `build_single.js`, and `standalone.js` after changes.
