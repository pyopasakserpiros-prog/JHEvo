---
name: qa-test-matrix
description: Master JianghuSect Evolution's 83-suite automated regression test matrix (test/run_all.js, tools/run_parallel_tests.js), data schema auditor (tools/validate_data_schema.js), 150-file JS syntax sweep, and milestone acceptance gates.
origin: jianghusect-custom
category: qa-verification
---

# JianghuSect QA & Regression Test Matrix (83 Suites + Schema Auditor)

## Purpose
Ensure every code or data change in **JianghuSect Evolution (JHEvo)** is verified against the complete regression test matrix (`GAME_SOURCE/test/run_all.js`, `GAME_SOURCE/tools/run_parallel_tests.js`, `GAME_SOURCE/tools/validate_data_schema.js`).

Use this skill whenever:
- Preparing a patch implementation or release handoff
- Writing a new test suite for a new patch (`test/v2xx_*_suite.js`)
- Mapping modified files (`js/*`, `data/*`) to their targeted verification suites

---

## 1. The 4-Stage Release Gate

Before declaring any patch or task complete, verify all 4 stages inside `GAME_SOURCE/`:

1. **Stage 1 — Data & Combat Schema Integrity (`tools/validate_data_schema.js`)**:
   ```bash
   node tools/validate_data_schema.js
   ```
   - Must report **`Errors: 0`** across all items, recipes (`REC_*` / `ITEM_*` Dual-IDs), martial techniques, weapon affinities, elemental profiles, timed/passive effects, and Edit Hub catalog spawnability.

2. **Stage 2 — Core Lock & Syntax Sweep**:
   ```bash
   node test/core_lock.js
   ```
   - Verifies `HC.FINGERPRINT === '155:2f9c9dd7'` and checks `--check` syntax across all `.js` files in `data/`, `js/`, `tools/`, and `test/`.

3. **Stage 3 — Standalone Single-File Build**:
   ```bash
   node tools/build_single.js
   node test/standalone.js
   ```
   - Rebuilds `GAME_SOURCE/JianghuSect_single.html` and verifies the inlined bundle matches `index.html`.

4. **Stage 4 — Full 83-Suite Regression Matrix**:
   ```bash
   node tools/run_parallel_tests.js
   # or sequential:
   node test/run_all.js
   ```
   - Note: In headless CLI environments without a Chromium binary (e.g., Android Termux), the 7 CDP browser suites (`skill_visual_browser`, `browser_mobile_perf`, `input_cancellation`, `startup_ui`, `outside_visual_browser`, and the browser half of `inventory_grid_ui_suite` & `fishing_river_suite`) will report `No Chromium executable found`; all 76 pure Node.js logic suites and syntax checks must pass **100%**.

---

## 2. Domain-to-Suite Mapping Matrix

| Domain Changed | Mandatory Suites to Run Immediately |
| :--- | :--- |
| **Cultivation & 9 Paths (`js/cultivation.js`, `data_cult.js`)** | `martial_paths`, `demon_heartsoul_paths`, `v208_paths_and_beast_pets_suite`, `v209_facilities_party_synergy_suite`, `successor_and_archetypes_suite`, `specialization_tracks`, `bottleneck` |
| **Combat, Martial Arts & Buffs (`js/combat.js`, `js/martial.js`, `js/stats.js`)** | `combat_balance`, `combat_passives`, `combat_stats`, `weapon_subpath_gear_expansion_suite`, `resonance_tactics_assembly_suite`, `unified_weapon_skills_and_archetypes_suite`, `elemental_effect_scaling_suite` |
| **NPC AI & Cognition (`js/ai.js`, `js/cognition.js`)** | `npc_cognition`, `npc_offices`, `npc_command`, `npc_social_help`, `npc_life_authority_overhaul`, `cultivator_sleep_scaling_suite` |
| **Economy, Crafting & Market (`js/economy.js`, `js/cpeco.js`, `js/external_market.js`)** | `cp_economy`, `cpeco`, `craft_transactions`, `recipe_coverage`, `recipe_scroll_lifecycle`, `external_market`, `external_market_expansion_suite`, `unified_donation_suite`, `welfare_production_policies` |
| **World Map, Ecology & Fishing (`js/world_map.js`, `js/fishing.js`, `js/wildlife.js`)** | `fishing_river_suite`, `wild_resources`, `wildlife_batches`, `wildlife_spawn_integrity`, `onmap_wildlife`, `beast_ecology`, `explore`, `exploration_replay` |
| **UI, Atlas & Edit Hub (`js/ui.js`, `js/render.js`)** | `ui_content`, `npc_sheet_tabs_suite`, `inventory_grid_ui_suite`, `phase2_edit_hub_inventory`, `edit_spawner_id_resolution_test`, `edithub_crosssect_progression_suite` |
| **Save/Load & Core (`js/sim.js`, `js/human_core.js`)** | `core_lock`, `save_integrity`, `legacy_save`, `standalone` |

---

## 3. Writing New Patch Test Suites

When implementing a new patch (e.g., `v2.0.10`), always create a dedicated regression suite in `GAME_SOURCE/test/` and append its basename to `const tests=[...]` in `GAME_SOURCE/test/run_all.js`:
- Load the engine via `require('./load.js')`.
- Use `const assert = require('assert');` and deterministic world seeds (`SIM.create(12345)`).
- Test both positive behavior (feature works across all 9 paths), boundary conditions (expiration, caps, zero-resource fallbacks), and save/load round-trip preservation.
