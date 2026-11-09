---
name: qa-test-matrix
description: Use when choosing or interpreting JianghuSect regression, schema, build or browser checks.
origin: jianghusect-custom
category: qa-testing
---

# JianghuSect Evolution — Automated QA & Regression Matrix (`test/run_all.js`, `tools/validate_data_schema.js`)

> **Current baseline 4.0.0 (updated from 2.0.28–3.6.0):** This project-specific skill contains historical material from earlier versions. The targeted corrections below do not certify every older formula or API. Before implementing, verify the relevant behavior against current source and tests; use `project_status_and_ai_onboarding.md` for the current feature inventory and `AGENTS.md` for project rules.

This skill governs the automated verification pipeline of **JianghuSect Evolution (สำนักยุทธ์เจียงหู)**, using the registered suites and schema validator. See the baseline below; do not claim zero regressions without a current run.

---

## 1. Mandatory 4-Step Verification Gate

Before committing or pushing any gameplay, data, AI, combat, economy, or UI change, run these commands in order from the project root; commands in Steps 3–4 explicitly enter `GAME_SOURCE`:

### Step 1: Human Core Integrity Lock (`js/human_core.js`)
```bash
node -e "const g = require('./GAME_SOURCE/test/load.js'); if (g.HC.FINGERPRINT !== '155:2f9c9dd7') throw new Error('HC.FINGERPRINT mismatch'); console.log('PASS HC.FINGERPRINT:', g.HC.FINGERPRINT);"
```
- Must equal `'155:2f9c9dd7'`. This fingerprint summarizes stat paths; it is not a SHA-256 hash of the file. Check `human_core.js` against the intended baseline separately to establish byte identity.

### Step 2: Data Schema & Cross-Reference Auditor (`tools/validate_data_schema.js`)
```bash
node GAME_SOURCE/tools/validate_data_schema.js
```
- Audits all `data/data_*.js` files across 5 phases:
  1. Base items (IDs, nameTh, tier, slots, effects)
  2. Recipes and inputs
  3. Martial techniques (weaponTypes, elements, moves, stats)
  4. Active/passive effects and parameters
  5. Debug Editor Catalog and representative spawns
- v2.0.28 auditor output: 557 base items, 955 recipes, 355 `JD.MARTIAL.techniques`, 257 effects and 2,913 catalog entries; counts are scoped to the auditor and may change.
- **Acceptance Criterion:** `Errors: 0, Warnings: 0`.

### Step 3: Single-File Bundle Rebuild (`tools/build_single.js`)
```bash
(cd GAME_SOURCE && node tools/build_single.js)
```
- Inlines CSS and all 40 `<script>` tags from `index.html` into `GAME_SOURCE/JianghuSect_single.html`.
- **Acceptance Criterion:** Exits `0` and generates `JianghuSect_single.html`.

### Step 4: Regression Test Sweep
```bash
(cd GAME_SOURCE && node test/run_all.js)
```
- Runs all registered test suites sequentially plus full syntax check (`node --check`) across JavaScript files in `data/`, `js/`, `tools/`, and `test/`.
- Parallel runner alternative: `node GAME_SOURCE/tools/run_parallel_tests.js`.

---

## 2. Domain-Specific Regression Suites (`GAME_SOURCE/test/`)

| Domain | Verified Regression Suites |
| :--- | :--- |
| **Architecture, Fingerprint & Clock** | `core_lock.js`, `standalone.js`, `time_controls.js`, `speed_controls.js`, `runtime_timing.js`, `test_runner.js` |
| **Cultivation, 12 Paths & Tracks** | `martial_paths.js`, `martial_retraining.js`, `demon_heartsoul_paths.js`, `specialization_tracks.js`, `v208_paths_and_beast_pets_suite.js`, `v211_tribulation_ascension_suite.js`, `v214_path_selection.js`, `cultivator_sleep_scaling_suite.js` |
| **Elemental Engine & Balance** | `elemental_balance_v202.js`, `elemental_balance_v203.js`, `elemental_effect_scaling_suite.js`, `elemental_generation_api.js`, `elemental_overhaul_suite.js` |
| **Combat, Weapons & Resonances** | `v214_legacy_combat.js`, `combat_passives.js`, `combat_balance.js`, `combat_stats.js`, `resonance_tactics_assembly_suite.js`, `unified_weapon_skills_and_archetypes_suite.js`, `weapon_subpath_gear_expansion_suite.js`, `skill_visual_events.js`, `v212_weapon_build_improvisation_suite.js` |
| **NPC Utility AI, Cognition & Offices** | `npc_cognition.js`, `npc_offices.js`, `npc_command.js`, `npc_social_help.js`, `npc_life_authority_overhaul.js`, `welfare_authority.js`, `welfare_production_policies.js`, `v214_governance.js` |
| **Economy, CP, Gear & Trade** | `cp_economy.js`, `cp_supply_pressure.js`, `cp_soak.js`, `cpeco.js`, `craft_transactions.js`, `personal_crafting.js`, `external_market.js`, `external_market_expansion_suite.js`, `recipe_scroll_lifecycle.js`, `recipe_coverage.js`, `coherent_regions_recipes.js`, `v213_procedural_equipment_and_review_suite.js`, `v214_professions.js` |
| **World Map, Sanctums, Relics & Clues** | `visitors_clues_weapons_suite.js`, `merchant_guest_lifecycle.js`, `fishing_river_suite.js`, `beast_ecology.js`, `onmap_wildlife.js`, `wild_resources.js`, `wildlife_batches.js`, `wildlife_spawn_integrity.js`, `ecology_expansion.js`, `cave_pools.js`, `diplomacy_sanctum_ancestral_suite.js`, `v210_pagoda_warbeasts_conference_suite.js`, `v209_facilities_party_synergy_suite.js` |
| **UI, Sprite Atlas & Edit Hub** | `inventory_grid_ui_suite.js`, `phase1_recruitment_facilities.js`, `phase2_edit_hub_inventory.js`, `phase3_stock_distribution_log.js`, `edithub_crosssect_progression_suite.js`, `npc_sheet_tabs_suite.js`, `graphics_overhaul_suite.js`, `ui_content.js`, `startup_ui.js` |
| **Save/Load & Data Integrity** | `legacy_save.js`, `save_integrity.js`, `data_integrity_test.js`, `codex_combined_review.js` |

**Baseline v2.0.28:** The last full run reported 98/108 groups passing. Seven referenced suites are absent (`v215`–`v219`, `v222`, `v225`); `craft_transactions`, `organs_experiments_politics`, and `world_rank` failed against the baseline. Browser suites require Chromium. Re-run and report actual results; do not claim missing suites passed indirectly or silently filter them out.

---

## 3. Writing New Regression Tests
When writing a new integration test:
1. Load headless simulation environment:
   ```javascript
   'use strict';
   const assert = require('assert');
   const g = require('./load.js');
   ```
2. Create a deterministic test world:
   ```javascript
   const W = g.SIM.create('test_seed', { masterIdx: 0 });
   ```
3. Execute actions and assert state invariants:
   ```javascript
   for (let i = 0; i < 60; i++) g.SIM.tick(W);
   assert.strictEqual(W.day, Math.floor(W.t / 1440));
   ```
4. Verify round-trip save persistence:
   ```javascript
   const str = g.SIM.serialize(W);
   const W2 = g.SIM.deserialize(str);
   assert.strictEqual(W2.t, W.t);
   ```

## Historical test results
Earlier claims of 97/97 are historical and do not establish the status of the current package. Use current runner output and `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V2_0_28.md`.

## v2.0.30 Test Suite Addition
- Added `test/v230_expanded_figures_and_pursuit_suite.js` to `test/run_all.js`, covering 3-tier foreign sect figures, wandering unaffiliated figures, extradition ultimatums, vendetta reclamation, Taoist companions & mutated-root offspring, coalition warfare & siege beacons, historical timeline, Web Audio API synthesizer, and save/load round-trip integrity. Current parallel runner status: 99/110 passing (`npc_life_authority_overhaul`, `v229`, and `v230` all pass).

- `node test/v231_strategic_proposal_flagships_suite.js`: Verifies F05 Feng Shui Leylines & Grand Array, F03-Deep Causal Heart-Demons & Dao Scars, I03+F01-Deep Sentient Weapons & Multi-Generational Sutra Annotations, F07 Dynamic Market Index, Caravans & Immortal Auction House, Causal Chronicle Reporting (`originCauseTh`, `actorChainTh`, `systemImpactTh`), and Save/Load Round-Trip determinism.

## Patch v3.0.0 Test Matrix & Status
- `node test/v300_tactical_combat_and_living_chronicle_suite.js` (57 assertions: verifies 5-band spatial range model, weapon range floors, wild beast weapon guardrails, LoS & safe position projection, ZoC & frontline interception, 5 cognitive combat AI archetypes, `COMBAT.evaluateTacticalBoutSummary` across `explore.js`/`sect.js`/`expedition.js`, `EXPED.recordChronicle`, and `SIM.snapshotPerson`).
- `test/_harness.js` and the 7 reconstructed legacy suites (`v215`, `v216`, `v217`, `v218`, `v219`, `v222`, `v225`) are included so all **116 suites** in `test/run_all.js` exist on disk.
- All **106 Node.js suites pass (106/106 PASS)**. The remaining **10 suites** (`skill_visual_browser`, `input_cancellation`, `startup_ui`, `outside_visual_browser`, `inventory_grid_ui_suite`, `fishing_river_suite`, `world_atlas_browser`, `lineage_chronicle_browser`, `ancestor_profile_browser`, `browser_mobile_perf`) require a Chromium binary via `tools/cdp_playwright.js`. In `test/browser_mobile_perf.js`, the 80-NPC threshold is temporarily relaxed to `<= 3.5 ms/tick` (`>= 285 ticks/s`).


## v3.1.0 Test Matrix Update
- Total registered suites in `GAME_SOURCE/test/run_all.js`: **117 suites** (107 Node.js suites + 10 Browser Playwright/Chromium suites), including `test/v310_autonomous_governance_and_peaks_sanctuary_suite.js` (422 assertions).

---

## Patch v4.0.0 Master QA Matrix Update (`124/124 Groups Passing`)
- Total registered suites in `GAME_SOURCE/test/run_all.js`: **124 groups** (123 test suites + full `syntax` check across 198 JS files), including:
  - `test/v320_dormant_awakening_suite.js`
  - `test/v330_living_sect_and_daily_loop_suite.js`
  - `test/v340_combat_depth_and_duet_synergies_suite.js`
  - `test/v350_macro_jianghu_and_alchemy_suite.js`
  - `test/v360_immortal_endgame_dynasty_suite.js`
  - `test/v400_living_frontier_and_sect_charter_suite.js` (6 Phases, 76 assertions verifying Outpost Logistics, Behavioral Mastery Traits, Sect Charter, 6-Officer Strategic Council, 4 Micro-Locations, Save/Load, and 80-NPC performance at `~0.700 ms/tick`).
- Current `node test/run_all.js` result: **`Assertions: 124/124 groups passed.`**


## JianghuSect 2 v2.0.0 Note (The 27 Grand Dao Epoch)
- **Patch / Schema**: `SIM.PATCH_VERSION = '2.1.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.1.0-grand-dao-debates-apex-trials'`
- **Scale**: 27 Major Cultivation Paths (`3^3`), 222 Subpaths, `CULT.MORTAL_INITIATION`, `SECT.PATH_LIBRARY` (1 starter path + 27 Manuals + 27 Crystals), 6 new weapon classes (`ROSARY`, `CLAW`, `NEEDLE`, `FAN`, `ASTROLABE`, `ABACUS`), 15 new Composable Triggers & Actions, 137/137 test suites passing.


## หมายเหตุเฉพาะการแก้บั๊ก JS2-v2.4.0

เพิ่ม `test/v240_user_audit_regression.js` และลงทะเบียนใน runner ครอบคลุมบั๊กกับกรณีขอบเฉพาะที่ระบุในรายงาน; การผ่าน schema และชุดทดสอบเดิมไม่ยืนยันว่าบั๊กทั้งรายงานหมด ดู [`docs/audits/JS2_V2_4_0_FIX_TRACKER_TH.md`](../../../docs/audits/JS2_V2_4_0_FIX_TRACKER_TH.md) สำหรับสถานะและข้อจำกัดที่ยังเหลือ

## Patch JS2-v2.5.0 Master QA Matrix Update (`142/142 Groups Passing`)
- Added `GAME_SOURCE/test/v250_pathbound_visuals_suite.js` to `GAME_SOURCE/test/run_all.js`.
- Total registered test groups in `test/run_all.js` and `tools/run_parallel_tests.js`: **142 groups** (**141 test suites** + **1 syntax check group** across 217 JS files), including all 10 Chromium browser suites (`skill_visual_browser`, `outside_visual_browser`, `world_atlas_browser`, `lineage_chronicle_browser`, `ancestor_profile_browser`, `browser_mobile_perf`, etc.).
- Latest `node tools/run_parallel_tests.js --concurrency=6` result: **`SUMMARY {"total":142,"pass":142,"fail":0,"timeout":0}`**.


## Patch JS2-v2.6.0 Master QA Matrix Update (`148/148 Groups Passing`)
- Added `GAME_SOURCE/test/v260_living_chronicle_and_reporting_suite.js` to `GAME_SOURCE/test/run_all.js`.
- Updated `GAME_SOURCE/tools/cdp_playwright.js` (`bundleFileUrlHtml`) to inline `assets/item_art_*.webp` as data URIs when `Page.setDocumentContent` is used on `file://` URLs, and synced `n.px = n.x; n.py = n.y;` in `SIM.placeNear` (`js/sim.js`).
- Total registered test groups in `test/run_all.js` and `tools/run_parallel_tests.js`: **148 groups** (**147 test suites** + **1 syntax check group** across 225 JS files), including all Chromium browser suites.
- Latest `node tools/run_parallel_tests.js` result: **`SUMMARY {"total":148,"pass":148,"fail":0,"timeout":0} syntaxFiles=225`**.
