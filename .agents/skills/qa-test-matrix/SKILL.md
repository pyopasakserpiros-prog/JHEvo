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

## JS2-v2.5.0 weapon-motion visual coverage
- `test/weapon_motion_vfx_suite.js` and `test/weapon_motion_vfx_browser.js` are registered in `test/run_all.js`. They cover 17 actual equipment families, low/reduced paths, combat event snapshots, renderer direction, pixel-distinct geometry, legendary precedence, and save/RNG purity. `test/skill_visual_events.js` also checks heal/support/harmonize recipients, mixed command attacks and ally buffs, and multi-enemy target snapshots.
- Browser coverage verifies Canvas pixels for recipient markers and persistent active-buff aura families; the Node suite checks expiry and confirms the aura renderer never mutates serialized world/status data.
- The browser case verifies recipient markers and a continuing active-buff aura paint pixels. The Node case checks guard/healing family routing, expiration, and that rendering leaves serialized world/status data untouched.
- Browser test may require `BROWSER_TEST_BASE_URL` when `file://` is blocked. Record browser launch/environment failures separately from code assertion failures; pixel uniqueness does not prove physical-device frame rate.

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

## JS2-v2.6.0 main Skill VFX regression coverage
- Registered `test/skill_vfx_expansion_suite.js` before the Signature browser audit. It verifies 15 exact new technique assignments, baseline no-effect results for parent/object-based child moves, real combat cast routing, and a friendly multi-recipient cast.
- `test/signature_vfx_catalog_browser_audit.js` now expects 45 Signature forms, checks all pixel hashes remain unique, retains all 43 path-crown checks, and compares a single-recipient faith cast against its actual multi-recipient drawing.
- Run these with `test/skill_visual_events.js`, `test/weapon_motion_vfx_suite.js`, `test/weapon_motion_vfx_browser.js`, the full test runner, schema validation and standalone build. A pixel-distinct gallery does not certify physical-device FPS.
- Latest parallel result: `152 groups, 150 pass, 1 fail, 1 timeout` across 151 suites + syntax (229 files). `browser_mobile_perf` was the variable failure (8× backlog 18.73 vs <16) but passed on isolated retry (1.4 ms/tick / 178.6× cap); `startup_ui` still times out because startup-overlay content intercepts pointer clicks. Do not attribute either browser-only result to Signature VFX without a reproduction.


## Common T1/T2 VFX refinement on JS2-v2.6.0 (2026-11-09)
- `SK.COMMON_VFX_CATALOG` has 30 forms; explicit common technique/passive/status maps cover 66 / 12 / 22 entries. Check `docs/audits/COMMON_SKILL_VFX_REGISTRY.md` as well as the Signature registry to avoid duplicate work.
- `Render.methods.drawCommonSkillVfx` is compact and render-only; `resolveCommonVfx` preserves explicit Signature/Legendary art. The renderer uses real cast tech/move IDs, not new save metadata. Basic casts use 540 ms / 11–15 px; no elemental burst overlay.
- `drawCommonStatusAuras`: at most one live positive and one live harmful state on actual NPC/foe/wild-beast recipients; expired/hidden/dead states skipped. `drawCommonPassiveAura`: one eligible active passive, restrained underfoot, only relevant activities or selected actor. Never infer a buff from a skill name.
- Run `test/common_skill_vfx_suite.js` and `test/common_skill_vfx_browser.js` alongside old weapon/Signature/Legendary regressions. Browser previews live in `docs/visuals/common-skill-vfx/`. Existing Signature count stays 45.


## T3 VFX and ordinary-tier scale (JS2-v2.6.0 refinement, 2026-11-09)
- `SK.T3_VFX_CATALOG` / `TECH_TO_T3_VFX` add 24 forms / 26 exact T3 active routes; `PASSIVE_TO_T3_VFX` has 8 entries and `STATUS_TO_T3_VFX` has 6 existing status IDs. Existing Common and Signature catalogs are unchanged.
- `SK.resolveT3Vfx` excludes other tiers, Legendary and explicit parent/move artwork. Renderer-only `t3Vfx` reads existing cast metadata; explicit per-event artwork wins. `drawT3SkillVfx` draws 16–20 px / 680 ms, one main silhouette + subtle echo; Low removes echo, Reduced Motion freezes it. No elemental/weapon overlay on this route.
- The shared persistent renderer selects ONE eligible mapped passive across both common and T3 arts; named T3 status glyphs are source-neutral because status IDs can originate from other tiers/items. Never infer gameplay strength or provenance from the glyph.
- `SK.NONLEGENDARY_VFX_BUDGET` records implemented T1/T2/T3 plus planned T4 24–29 px, T5 32–39, T6 42–47, T7 50–56. T4–T7 are reserved ceilings, NOT live new routes. Ordinary T7 stays below the new Legendary Apex main scale 60–84 px / 2,100–2,500 ms; the former 34–53 / 1,500 wrapper is now the legacy inner-identity renderer. Old named Signature art remains a preserved exception.
- See `docs/audits/T3_SKILL_VFX_AND_TIER_SCALE.md` before T4 work; run `test/t3_skill_vfx_suite.js` and `test/t3_skill_vfx_browser.js` with the previous Common/Signature/Legendary checks. A pixel gallery is not a physical-device FPS benchmark.


## Legendary Apex refinement (JS2-v2.6.0, 2026-11-09)
- `Render.LEGENDARY_SCENES` has 47 active-art profiles; `LEGENDARY_RELIC_SCENES` has 27 named-equipment profiles across 27 shared apparition families. Exact IDs, lifetimes, reuse policy and future-tier ceiling live in `docs/audits/LEGENDARY_APEX_VISUAL_REGISTRY.md`.
- `drawLegendaryArtVfx` now composes `drawLegendaryApparition`, `drawLegendaryRelease`, snapshot-only `drawLegendaryConduits` and a smaller `drawLegacyLegendaryArtVfx` identity core. `drawLegendaryRelicScene` composes its exact item glyph with slot-specific scene accents. Skills 2,100–2,500 ms; real proc scenes 2,100–2,400 ms. `Render.legendarySceneLife` is authoritative for presentation lifetime tests.
- Shared full-scene cap: two normally / one on Low / one per owner; compact identities retain other activations within the 24-event queue. Low removes bloom/reduces marks, Reduced Motion freezes decoration; no flash/time stop/camera shake. Three passive crowns also respect Reduced Motion.
- Skill links use real origin and target snapshots; current proc events have no victim positions, so equipment scenes remain owner-bound. Never fabricate a target or trigger combat mechanics while drawing. Broken/unusable/unregistered items retain existing eligibility/fallback behavior.
- T4–T7 reservations widen to 24–29 / 32–39 / 42–47 / 50–56 px (850 / 1,050 / 1,250 / 1,450 ms); those effects are NOT implemented. Named Legendary motifs are not demoted automatically.
- Run `test/legendary_apex_suite.js`, `test/legendary_apex_browser.js`, and existing Legendary/Common/T3/Signature tests. Canvas-only stress measurements are development-environment evidence, not mobile-device FPS. Legacy lifetime/expiry assertions must track the real profile, not stay fixed at 1,500 ms.
