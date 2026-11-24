# Patch Report — JS2 v3.9.9 Two-Spec Bugfix Audit (Fortune/Realms/Clues & UI/VFX/Observer-Autonomy)

**Base:** `JHEvo-main` (`JS2 v3.9.8`)  
**Release:** `JS2 v3.9.9` (display title `สำนักเมฆาหยก v3.9.9`; `SIM.PATCH_VERSION = '3.9.6'` and `SIM.SAVE_SCHEMA_VERSION = '3.9.6-deep-gameplay-integration'` retained for full save compatibility)  
**Date:** 2026-11-23  
**Specs Addressed:**
1. `bug reports/JS2 v3.9.6 — AI-Agent Patch Spec- Fortune Spots, Secret Realms, Clues & Out-of-Sect Landmarks Audit.pdf`
2. `bug reports/JS2 v3.9.6 — AI-Agent Patch Spec- UI, VFX, Rendering & Observer-Autonomy Compliance Audit.docx`

---

## 1. Constitutional Hard Locks & Observer-Autonomy Judgment (`AGENTS.md`)
- **`AGENTS.md`:** Byte-identical (`67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`).
- **`GAME_SOURCE/js/human_core.js`:** Byte-identical (`68,270` bytes, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`, `HC.FINGERPRINT === '155:2f9c9dd7'`).
- **40 `<script>` Tags:** Preserved identically across `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html`.
- **Policy Judgment on `BUG-UV01` / `BUG-UV02`:** Per `AGENTS.md:10` ("เครื่องมือแก้ไขตัวละคร/สถานะและตัวเสกเป็นข้อยกเว้นที่ผู้ใช้อนุญาต") and verified browser suites (`observer_controls_browser.js`, `startup_ui.js`), direct state-editing/spawning tools (`stones`, `food`, `heal`, Edit Hub, Spawner) remain accessible as permitted exceptions, while all 6 dead command buttons (`raid`, `beast`, `recruit`, `banquet`, `tourney`, `challenge`) and policy-overriding `edit-save-doctrine` (`BUG-UV05`) were pruned/blocked.

---

## 2. Summary of Fixes Implemented

### Spec 1 — Fortune Spots, Secret Realms, Clues & Out-of-Sect Landmarks
- **Dead Loot & Handover (`content.js`, `expedition.js`, `cpeco.js`, `explore.js`):**
  - `EXP01-01/08-01`: `content.js` handover now accepts all valid `ECO.recipeById[id]` entries, rescuing all 24 `REC_V222_EQ_*` fortune recipe scrolls.
  - `EXP01-02`: Fixed attribute-keyed fortune checks (`perceptiveness`, `willpower`, `courage`) so 75% weight is no longer zeroed out.
  - `EXP01-03`: Shuffled `pool.beastParts` before slicing so indices 2–4 are reachable.
  - `EXP01-05/08-06`: Removed premature `W.sect.library.push` in `X.fortuneEvent`; manuals stage through `out.techs` -> `X.handover`.
  - `EXP01-06/07/09`: Fixed `ruins` biome matching, guarded `tradeResult`/`diplomacyResult`/`recruitResult`/`bounty` on total party wipe, added zero-guard on `pw + bp`, added Azure Dragon water `hazRed`, clamped mount `gradeRank`.
  - `EXP08-04/05/08/09/10`: Fixed `exchangeWithCraftElder` phantom `'herb'`/`'ore'` -> valid T2 materials and `ECO.addCatalyst`; hardened `X.handover` (`out.notes` init, finite guards in `handover` & `CPE.donorValue`, deduplicated `out.techs`, excluded Sect Master & rank >= 5 from `hoarder()`).
  - `EXP03-03/05-02/08-02/08-03`: Redirected Rift-Shard #10 gear strictly to `W.sect.gear` (removed orphaned `W.sect.armory` write) and removed direct `W.sect.rep` shadowing in Rift-Shard #12.
- **Expeditions, Anomalies, Secret Realms & Witnesses (`expedition.js`, `explore.js`, `sect.js`, `ai.js`):**
  - `EXP01-04/02-03/02-06/09-03`: Excluded `n.expId` / leaving NPCs from `X.rally`, `AI.isProtectedAction`; released held stations in `travelStep`; added `leaving` timeout (>180 min) and `!m.exiled` filter in `X.hourly`.
  - `EXP02-02/12-01` & `EXP10-03/07/08/12`: Fixed `% 3` modulo lock (`Math.floor(day/24) % 3`) so all 3 `ANOMALY_TEMPLATES` rotate and unlock `WESTERN_BADLANDS`; wired `grantRelicCatalyst`, topology refresh on expiry, integer `Math.ceil(rivalEtaDay)`, anomaly cap (30), and `resolvedDay` on loss.
  - `EXP02-04/05/09` & `EXP09-04` & `EXP10-02/05/06`: Added `discoveredRegions` fog check in `sect.js` AI; added `AI.interruptFor` + `hidden = true` + real meal supplies in departure flows; recomputed garrison on stripped nodes; filtered dead war beasts in `resolveSectSiege`; wired periodic rival `contestResourceNode` and guarded player fame.
  - `EXP03-02/04/05/06/07/08/09/10`: Added Rift-Shard #13 (`DAO_ZHI_SHADOW_ARCHIVE`) opening trigger & read-only summary exposure (`totalShardsCount: 13`, `daoZhiArchiveOpen`); prevented Rift-Shard #10–#12 multi-claim per window (`lastClaimedUntilDay`); scaled Wandering Legend entrant power & added win branch; prioritized `OPEN` realm instances in `resolveSecretRealmRace`; fixed double `"สำนัก"` prefix; shuffled `rewardMatIds`; fixed A-Ping Tier 0 & mentorship; fixed `_cal(W)` fallback off-by-one.
  - `EXP04-01/03/04/05/06/07` & `EXP05-01/03/06/07/08/09` & `EXP09-05/06/07/08`: Null-guarded `approver`, aligned `cands` filter, rebalanced `orig` weight, and randomized `openShards` in `EX.tryVolunteer`; handled `'boon'` encounter kind; added procedural gear fallback for T5–6 drops; fixed total party wipe log/fame in `EX.resolve`; fixed phantom `SANCTUM_MYRIAD_BEAST_TOTEM` subPaths (`MYRIAD_BEAST_PACK`, `PRIMORDIAL_BLOOD_MUTATOR`) and `WILDERNESS_RANGER` -> `SPIRIT_HUSBANDRY`; fixed Pagoda F44–F55 monotonic stone scaling (`1135..2070`); applied `bonusSkill`/`bonusCraft` and `bonusMatQty ?? 0` in `dispatchExploration`; separated `lastCityVisitDay` from `lastTrip`; moved `SECT.AUTONOMY.consider` cooldown stamp inside `if (result?.ok)`.
- **Clues, Wildlife, Fishing & Map (`visitors_clues.js`, `wild_resources.js`, `fishing.js`, `world_map.js`, `combat.js`):**
  - `EXP06-02/03/05/06`: Scoped `intendedRecipientId` delivery to `clueInstanceId`; added `nextRetryDay` backoff on resource-denial blocks; scanned `ex.clueOut.gear` in unique-weapon invariants; replaced `'healer'` -> `'herbalist'`.
  - `EXP07-01..09` & `EXP08-07`: Allowed veterans to gather exterior `BASIC_HERB`; fixed `unsafeFull` safe-belt targeting and `MAT_ORE_COPPER_1` -> `MAT_ORE_SPIRIT_IRON_1`; aligned `countCookableFish` (`tier <= 2`), preserved Azure Dragon 1.25× `maxStock`, dynamic dish lookup, `injuryHealBonus`, quality cap `1.55`, and `f.stats.attempts++` in leisure fishing; added 3×3 decor keep buffer around `MAP.MICRO_LOCATIONS`.
  - Bonus Runtime Fix: Fixed `ReferenceError: ST is not defined` in `combat.js:908` (`g.STATS && g.STATS.dirty`).

### Spec 2 — UI, VFX, Rendering & Observer-Autonomy Compliance
- **Observer-Autonomy & UI Stability (`ui.js`, `css/style.css`, `index.html`):**
  - `BUG-UV01/03/04/05/06`: Pruned 6 dead stripped tool buttons in `rMenu`; removed render-time `refreshTavernRumors` and `openSeasonalAuction` mutations in `rWorld`; moved `UI.filterPlayerControls(html, UI.sheet)` to a single final pass in `UI.render()`; blocked `edit-save-doctrine` policy override; converted 8 Extraordinary Meridians to read-only `<span class="chip">` badges.
  - `BUG-UV10/11/13/15/16/18/20/23` & `EXP11-01/03/04/05/06`: Normalized root z-index stack (`#minimap:8 < #sheet:15 < #hudBottom:16`); fixed `bindWorldAtlas` `atlasDragging` freeze & zero-width `NaN` view; null-guarded `actText(n)` for Witness NPCs and `G.W.seed` in `rMenu`; retried suspended `SFX._ctx.resume()` and suspended on mute; fixed `linkify` `&amp;` order & longest-token-first sorting; guarded `_origRWorldEp` to `sects` tab; resolved Rift-Shard names in active expeditions; moved World/Cave Codex to `CODEX` pane and added read-only Micro-Locations card in `rDisc`; allowed mobile pinch-zoom in `index.html`; added missing utility CSS classes and `.act-row:empty`.
- **Render, VFX & Save Hygiene (`render.js`, `data/data_martial.js`, `skills.js`, `sim.js`):**
  - `BUG-UV25/26/27/28/29/30/31/32/35/36/37/40/43/44/45/46`: Fixed Celestial Shader object coercion (`W.celestialAlignment.activeEvent`); replaced `ctx.clearRect` coin hole-punch with `evenodd` path; guarded `rn.materialId` in `drawWildResource`; included `GRAND_DAO_RELIC_VISUALS` in `LEGENDARY_RELIC_SCENES` & `drawLegendaryRelicScene`; guarded `W.weather`; moved 12 `LEG_*`/`TRANS_*` signature VFX from `QINGGONG_BY_NEW_PATH` into `SIG_VFX_BY_NEW_PATH`; registered all 10 `EFX_V320_*` VFX aliases in `skills.js`; fixed rightmost/bottom chunk `Math.ceil` bounds; added `isReducedMotion()` strobe guard & `BACKFIRE` glaze; prioritized apex VFX over low-tier procs on queue eviction; guarded `R.portrait` & `hpBar`/`drawFoe` against `NaN`/`hpMax=0`; added `POISON_CORROSION` & `ASTRAL_VOID` palettes; fixed `clockwork_golem_halo` typo; added 18 transient VFX keys to `SIM.TRANSIENT_CACHE_KEYS` (preserving `_stSig`).

---

## 3. Verification Gate Results
- `node GAME_SOURCE/test/core_lock.js`: **PASS** (`HC.FINGERPRINT === '155:2f9c9dd7'`)
- `node GAME_SOURCE/tools/validate_data_schema.js`: **0 Errors, 0 Warnings**
- `node GAME_SOURCE/tools/lint_lore_archive.js`: **0 Errors, 0 Warnings** (104 books, 736 events)
- `node GAME_SOURCE/test/v399_two_specs_bugfix_suite.js`: **PASS (8/8)**
- `node GAME_SOURCE/test/v397_comprehensive_audit_bugfix_suite.js`: **PASS**
- `node GAME_SOURCE/test/full_release_audit_and_behavior_suite.js`: **PASS (6/6)**
- `node GAME_SOURCE/test/observer_controls_browser.js`: **PASS** (599 controls inspected, 157 blocked, 0 violations)
- `node GAME_SOURCE/test/startup_ui.js`: **PASS (7/7)**
- `node GAME_SOURCE/test/world_atlas_browser.js`: **PASS** (390×844, 800×360, 1280×800)
- `node GAME_SOURCE/test/browser_mobile_perf.js`: **PASS** (80-NPC stress `2.002 ms/tick <= 3.5 ms/tick`)
- `node GAME_SOURCE/test/explore.js`, `world_atlas.js`, `visitors_clues_weapons_suite.js`, `fishing_river_suite.js`, `wild_resources.js`, `v210_pagoda_warbeasts_conference_suite.js`, `legendary_visual_identity_suite.js`, `v250_pathbound_visuals_suite.js`, `weapon_motion_vfx_suite.js`: **ALL PASS**
- `cd GAME_SOURCE && node tools/build_single.js`: **PASS** (`23,708 KB`, 40 inline scripts)
- `node GAME_SOURCE/test/standalone.js`: **PASS**
