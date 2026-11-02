---
name: qa-test-matrix
description: Master JianghuSect Evolution's 84-group automated regression test matrix (test/run_all.js, tools/run_parallel_tests.js), data schema auditor (tools/validate_data_schema.js), 154-file JS syntax sweep, and milestone acceptance gates.
---

# JianghuSect Evolution — Automated QA & 83-Suite Regression Matrix Blueprint (`test/run_all.js`, `tools/validate_data_schema.js`)

This skill governs the automated verification pipeline of **JianghuSect Evolution (สำนักยุทธ์เจียงหู)**, ensuring zero regressions across all 83+ test suites, 150 JS files, and 1,008+ data definitions.

---

## 1. Mandatory 4-Step Verification Gate

Before committing or pushing any gameplay, data, AI, combat, economy, or UI change, run these commands in order from `/data/data/com.termux/files/home/jhevo-work`:

### Step 1: Human Core Integrity Lock (`js/human_core.js`)
```bash
node -e "const g = require('./GAME_SOURCE/test/load.js'); if (g.HC.FINGERPRINT !== '155:2f9c9dd7') throw new Error('HC.FINGERPRINT mismatch');"
```
- Must always equal `'155:2f9c9dd7'` (SHA-256 locked).

### Step 2: Data Schema & Cross-Reference Auditor (`tools/validate_data_schema.js`)
```bash
node GAME_SOURCE/tools/validate_data_schema.js
```
- Audits all `data/data_*.js` files for duplicate IDs, missing `nameTh`, invalid `compatiblePath`, broken `REC_*` / `ITEM_*` Dual-ID links, invalid weapon classes, and orphaned drop table references.
- **Acceptance Criterion:** `Errors: 0`.

### Step 3: Single-File Bundle Rebuild (`tools/build_single.js`)
```bash
cd GAME_SOURCE && node tools/build_single.js
```
- Inlines CSS and all 40 `<script>` tags from `index.html` into `GAME_SOURCE/JianghuSect_single.html`.
- **Acceptance Criterion:** Exits `0` and updates `JianghuSect_single.html`.

### Step 4: Full Regression Test Matrix (`test/run_all.js` or `tools/run_parallel_tests.js`)
```bash
cd GAME_SOURCE && node test/run_all.js
# Or parallel runner for faster execution on multi-core environments:
cd GAME_SOURCE && node tools/run_parallel_tests.js
```
- **Acceptance Criterion:** `0` failed suites across all registered `test_*.js` files.

---

## 2. Targeted Domain Test Suites (`GAME_SOURCE/test/`)

When developing or debugging a specific subsystem, run its targeted test suites first for instant (`< 2s`) feedback:

| Subsystem / Pillar | Targeted Test Suites (`node GAME_SOURCE/test/<file>.js`) |
| :--- | :--- |
| **Latest Integrated Patches (v2.0.5–v2.0.9)** | `test_v205_features.js`, `test_v206_features.js`, `test_v207_features.js`, `test_v208_features.js`, `test_v209_integrated.js` |
| **Cultivation, 9 Paths, 78 Subpaths & Tracks** | `test_9paths_universal_companions.js`, `test_subpath_9realm_tracks.js`, `test_overhaul_pack.js`, `test_elemental_system.js`, `test_spiritual_root_capacity.js` |
| **Combat, Resonance Sets, Formations & Buffs** | `test_equipment_sets_formations_sanctums.js`, `test_combat_variety.js`, `test_legendary_33_expansion.js` |
| **NPC Utility AI, Cognition & 18 Offices** | `test_npc_cognition.js`, `test_autonomous_sect_governance.js`, `test_sect_delegation_hierarchy.js`, `test_sim_ai.js` |
| **Economy, CP Ledger, Catalysts & Trade** | `test_cp_economy_equilibrium.js`, `test_inventory_intelligence.js`, `test_catalyst_refinement.js`, `test_craft_receipt_idempotency.js`, `test_external_market.js` |
| **World Map, Fishing, Sanctums & Diplomacy** | `test_world_map_rivers_fishing.js`, `test_cross_sect_diplomacy.js`, `test_political_events_and_Sanctum_catalysts.js`, `test_wildlife_and_resources.js` |
| **UI, Sprite Atlas, Log Links & Edit Hub** | `test_wuxia_sprite_atlas_grid.js`, `test_player_edit_hub.js`, `test_log_link_integrity.js`, `test_ui_usability.js` |
| **Save/Load & 80x Performance Budget** | `test_save_migration.js`, `test_perf_80x_benchmark.js` |

---

## 3. Writing New Milestone Tests (e.g., `test/test_v210_integrated.js`)
Every new patch (such as `v2.0.10`) must add a dedicated integration test file in `GAME_SOURCE/test/` and register it in `GAME_SOURCE/test/run_all.js`:
1. Load the headless VM via `const g = require('./load.js'); const assert = require('assert');`.
2. Create a deterministic test world via `const W = g.SIM.create('test_v210_seed', { masterIdx: 0 });`.
3. Assert every new feature pillar (`EX.NINE_DAO_PAGODA`, `EX.ELEMENTAL_REALMS`, `W.sect.gateBeasts`, Spirit Mount Caravans, `SECT.WORLD_MARTIAL_CONFERENCE`, `VASSAL_TREATY`, and 14 `SECT.SECT_ARCHETYPES`).
4. Verify a full `const s = g.SIM.serialize(W); const W2 = g.SIM.deserialize(s);` round-trip preserves all new state fields.
