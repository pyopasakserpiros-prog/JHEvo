# Opus Orchestrator Brief — Necromancy Grand Dao Expansion (Corpse / Soul / 3rd+ Necro Paths)

**Target Branch:** `main-debug` (Base: JS2 v3.9.6 `cba4ba8`)  
**Goal:** Add **>= 3 genuinely distinct Major Cultivation Paths** (with **>= 4 Subpaths each**) centered on Necromancy — specifically contrasting **Physical Corpse Control (NPC & Beast bodies with techniques + equipment)** vs **Soul Control** vs **3rd+ Distinct Necro Dao**, fully integrated into simulation, combat, AI autonomy, economy/sources, UI, VFX, schema validator, and regression suites.  
**Quota Rule:** Everything below is pre-verified against JS2 v3.9.6 source. Do NOT waste tokens scanning whole data files (`data_expansion.js` = 57k lines, `data_martial.js` = 53k lines) or reading old v2.x docs. Read only exact line ranges listed here when editing.

---

## 1. Hard Constitutional Locks (NEVER VIOLATE)

1. **`AGENTS.md` & `GAME_SOURCE/js/human_core.js`:** NEVER modify either file.
   - `AGENTS.md` SHA-256: `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`
   - `GAME_SOURCE/js/human_core.js` SHA-256: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`, `HC.FINGERPRINT === '155:2f9c9dd7'`
2. **100% Observer-Autonomy (`AGENTS.md`):**
   - NPCs MUST autonomously harvest/claim corpses & souls, bind/refine them, decide when to equip gear onto a Corpse Thrall from their own bag/sect spare stock, summon/deploy them in battle, and maintain them—driven by personality/values/affinity/situation/sect policy.
   - ZERO player control buttons (`<button data-do="...">` that orders corpses/souls, equips thralls manually, triggers rituals, or swaps postures). UI additions in `js/ui.js` MUST be strictly **read-only observer views** (inspect thralls, equipped gear, bound souls, combat logs).
3. **Closed-Loop Resource Causality (No Free Spawns):**
   - **Corpses (`ศพ NPC / ศพอสูร`):** MUST originate from **actual deaths** (`COMBAT.slay` for foes/beasts/NPCs, `AI.kill`, `W.graveyard`, `WILD` hunts, or tomb/ruin expedition finds)—never infinite free spawning! When a Corpse Thrall is equipped with real `WEAPON`/`ARMOR`/`ACCESSORY` items, transfer real item instances cleanly (and return surviving items or handle loss/repair cleanly if destroyed—no duplication).
   - **Souls (`ดวงวิญญาณ`):** MUST originate from real deaths, battlefields, haunted/ruin expeditions, sect/world mortality, or soul-harvesting actions in combat/world.
4. **Strict 40-Script-Tag Load Order (`GAME_SOURCE/index.html` & `GAME_SOURCE/test/load.js`):** Do NOT add new `<script>` files. Add data/code to existing files (`data_martial.js`, `cultivation.js`, `combat.js`, `skills.js`, `stats.js`, `martial.js`, `ai.js`, `cognition.js`, `sect.js`, `explore.js`, `bottleneck.js`, `retraining.js`, `render.js`, `ui.js`, `sim.js`).
5. **Thai Wuxia Localization Rule (`test/v260_prose_naming_and_lore_canon_suite.js:112-115`):**
   - `nameTh` on every Path and Subpath MUST NOT contain English parentheticals matching `/\([A-Za-z]/` (clean Thai Wuxia names only!).

---

## 2. Anti-Overlap Map (Existing 55 Paths in JS2 v3.9.6)

Do NOT duplicate what already exists. Existing death/occult/puppet paths in `JD.CULT.paths`:
- `NETHER_GRAVE` (#38, `วิถีสุสานยมโลก` — 4 subs): Passive shield (`boneArmor`) scaling off `W.graveyard.length` + AoE bomb (`GRAVE_CORPSE_DETONATE` consuming `f._unconsumedCorpses`). Does **NOT** raise persistent NPC/Beast corpse entities carrying original skills & gear.
- `SOUL_PUPPETRY` (#27, `วิถีเชิดเงา` — 6 subs): Marionette threads (`tetheredEnemy`), paper effigies.
- `OCCULT_MAGE` (#36, `วิถีไสยเวทย์` — 4 subs): Yantra vows, Phray scout/hazard ward, Sacred Golem buff.
- `ANCESTRAL_RITUAL` (#39, `วิถีบรรพชน` — 4 subs): Lineage tablet worship buffs (`RITE_FERVOR`) & founder phantom in raid.
- Subpaths: `DEMON.NETHER_GHOST_KING` (ice/yin caster), `SAGE_SUPPORT.SOUL_LANTERN_SHEPHERD` (healer).
- `MECH_PUPPET` (#6): Mechanical constructs (`npc.mechState`), not biological corpses.
- `BEAST_SOVEREIGN` (#8): Living tamed spirit beasts (`npc.pets`), not undead beasts/NPC corpses.

---

## 3. Creative Design Mandate (Opus Full Creative Ownership)

**Do NOT wait for sub-ideas — Opus has 100% creative ownership** over path identities, >= 4 subpath concepts per path, mechanics, custom/reused keywords, thematic acquisition sources, and weapon/element design within these exact user requirements:

1. **Quantity & Completeness:** Add **>= 3 genuinely distinct Necromancy Major Paths** (suggest `maxStage: 8` to match standard Grand Dao paths) with **>= 4 distinct Subpaths per Path**, each with full components (`stages`, `subPaths`, `realmTraits`, `subpathTraits`, `lore`, tracks, gauges, passives, mantras, actives, Tier-7 Legendary, Pagoda floors, archetypes, VFX, UI, etc.) and distinct gameplay identities (no overlap with Section 2).
2. **Path 1 — Physical Corpse Control (`ควบคุมศพจริง — NPC & สัตว์อสูร`):**
   - Controls real **physical corpses** harvested from fallen **NPCs** or **Spirit Beasts / Monsters** (via real deaths/hunt/graveyard/crypts).
   - **Must have real body semantics:**
     - Retains/adapts **corpse techniques** (inherited/derived from the fallen NPC's `cult.techs` or slain beast's species natural moves in `JD.BEASTS`).
     - **Can equip real equipment** (`WEAPON` / `ARMOR` / `ACCESSORY`) that genuinely feeds into combat stats & martial logic (`STATS` / `MARTIAL`). *(Technical note: `stats.js:1284` `computeFoe` uses static `u.summonStats` for `isSummon`; persistent Corpse Thralls need live stat calculation from body + equipped gear + corpse techniques, and must persist across fights cleanly instead of being purged like temporary `isSummon` at `combat.js:4198`, while recovering/handling gear safely if destroyed without item duplication.)*
   - **>= 4 Subpaths:** Invented freely by Opus around different physical-corpse philosophies/specializations.
3. **Path 2 — Soul Control (`ควบคุมวิญญาณ — แยกจากศพกายภาพโดยสิ้นเชิง`):**
   - Fundamentally distinct from Path 1 (incorporeal soul/spirit entities, no physical body/equipment slots).
   - **All concepts, mechanics, soul resources, combat/sect/world roles, and >= 4 subpaths are 100% up to Opus to invent.**
4. **Path 3+ — Third (or more) Distinct Necro Dao:**
   - Must be mechanically and thematically distinct from BOTH Path 1 (physical corpses) and Path 2 (souls), and distinct from Section 2 (`NETHER_GRAVE`, `SOUL_PUPPETRY`, `OCCULT_MAGE`, `ANCESTRAL_RITUAL`).
   - **All concepts, mechanics, resources, and >= 4 subpaths are 100% up to Opus to invent.**
5. **Weapons & Elements (Flexible by Design):**
   - Do **NOT** feel forced to lock every path to one weapon or element. Choose freely per path/subpath: strict element/weapon lock where thematic, or multi-weapon / `'ALL'` / `requiresWeapon: false` / `'NEUTRAL'` (`EXPLICIT_NON_ELEMENTAL` / `ROOT_AGNOSTIC_UTILITY`), or open-to-all with conditional synergy bonuses (`bonusWeapon` / `bonusElement`).
6. **Keywords, Techniques & Thematic Acquisition Sources:**
   - **Keywords & Mechanics:** Feel free to reuse existing `COMBAT.KEYWORDS_CATALOG` / `COMBAT.COMPOSABLE_ENGINE` / `SK.ARCH`, create **brand-new Necro keywords/actions/statuses/buffs**, or combine both. *(Technical note: if adding to `COMBAT.KEYWORDS_CATALOG`, update `test/v240_composable_keywords_and_tactical_combat_suite.js:39` which asserts `=== 16`; register every `effectId` in `CE.IMPLEMENTED_EFFECT_IDS`, every status in `SK.STATUS` at `js/skills.js:65`, and every buff in `STATS.BUFF_CATALOG`.)*
   - **Techniques:** Author path-exclusive techniques (`MP_BASE_*`, actives, passives, **>= 2 valid Qi Mantras** with finite `.power` & `.cat` for `CULT.bestMantra`, and **1 Tier-7 `legendary: true` art** per path) **plus** Necro-themed techniques usable by **all paths** (`path: 'ANY'` or broad `compatiblePaths` with optional extra synergy for Necro practitioners).
   - **Acquisition Sources:** Design thematic discovery/acquisition channels matching each path (recipes/items/relics, expedition/ruin/tomb/crypt/sect routes, manuals/crystals, Pagoda floors `RES_NINE_DAO_<PATH>`, `SECT.ARCHETYPES`, zero orphan materials).

---

## 4. Mandatory Engine Touchpoints Checklist (Exact Anchors)

Follow the pattern used by `NETHER_GRAVE` + `LEG_*` / `TRANS_*` paths in `data/data_martial.js:50479-51500` & `52684-53060`:

| File | Exact Anchors / What to Add or Update |
| :--- | :--- |
| **`data/data_martial.js`** | Add Path specs (stages, `elementProfile`, `statWeights`, `realmTraits`, `subPaths` with `subpathTraits`, `RES_NINE_DAO_<PATH>`, `MANUAL_PATH_<PATH>`, `CRYSTAL_PATH_<PATH>`, `SUBPATH_CRYSTAL_<SUB>`, actives/passives/mantras/universal arts + **Tier-7 `legendary: true` art** per path). **Update `PATH_NAMES` (`52850`) & `SUB_NAMES` (`52851`)** inside `applyV260NamingAndLoreCanonSync()`. |
| **`js/cultivation.js`** | `CULT.THRESH[path]` (`1900`), `CULT.pathScores` `base[path]` (`2012`), `CULT.SUBPREF`, `CULT.PATH_DESCRIPTORS[path]` (`2313` — >= 3 stations, `combatOffenseBaseMult >= 1.09`, `combatDefenseTakenMult <= 0.93`, `mantraPerTier`), `CULT.PATH_GAUGES[path]` (`9340`), `CULT.GRAND_DAO_MECHANICS` (`ensureNpcState`, `monthlyAutonomousTick`, corpse/soul management), `PATH_PREF_QG`/`DEF`/`SUP`/`FORB_MAP`, `darkPath`/`LIFESTEAL_PATHS` where thematic. |
| **`js/stats.js`** | `PATHW` auto-loads `path.statWeights`; add `SUBFX` (or via `JD.MARTIAL.subStats`), `BUFF_CATALOG` entries, `_CONSTRUCT_UNDEAD_PATHS` (`85`) if appropriate, and **live stat calc for equipped Corpse Thralls** (`computeFoe` `1284` + `ST.get`). |
| **`js/combat.js`** | Persistent Corpse Thrall & Soul Entity deployment, turn step, corpse skill + **equipped gear evaluation**, `C.slay` (`3622`) corpse/soul capture hook (`!victim.isSummon`), fight-end thrall preservation/gear return (`4197`), `SK` summon/composite actions (`COMPOSABLE_ENGINE.executeAction` + `IMPLEMENTED_EFFECT_IDS`), `KEYWORDS_CATALOG` + `C.keywordsOf`, `runLegendaryDaoProc` / gauge finishers (`8755`, fix or guard local `ST` ref at `8261`!). |
| **`js/skills.js`** | New `SK.STATUS` (`65`), any `SK.ARCH`, `SK.SUBW` (`173`), `SK.PATH_PRIMARY_SIGNATURE_VFX` (`2129`), T6/T7 VFX mappings (`3414`, `5649`), `SK.validateComposableSpec` compatibility. |
| **`js/martial.js` & `js/bottleneck.js` & `js/retraining.js`** | `MARTIAL.PROFILES` / `SUB_EQUIP_BONUSES` / `SYNERGIES` (ensure all new subpaths pass `validate_data_schema`), `BN.GRAND_DAO_BT_LINEAGE` (`bottleneck.js:13`), cross-path retrain cleanup/release of bound corpses/souls in `retraining.js` & `cultivation.js:15053`. |
| **`js/sect.js`** | `SECT.ARCHETYPES` & `SECT.ARCHETYPE_WEAPON` (`17245` — `v210` asserts ALL paths are selectable via archetypes!), `PEAKS.PATH_SANCTUARY_BLESSINGS` (`13197`), `UNIVERSAL_EQUITY_V235` (`13830`), dark/orthodox sect policy reactions if raising corpses in sect, `EDITOR.catalog` & `PATH_LIBRARY` compatibility. |
| **`js/ai.js` & `js/cognition.js`** | Autonomous NPC corpse/soul harvesting, autonomous equipment assignment from necromancer's bag/spare gear onto Corpse Thrall, upkeep/healing/cultivation routing (`A.cultivate`), utility awareness in `COG`. |
| **`js/explore.js`** | Add 1 floor per new path to `EXPLORE.NINE_DAO_PAGODA.floors` (`8011-8067`) + `pagodaSetPieces` (`RES_NINE_DAO_<PATH>`). |
| **`js/sim.js`** | Ensure `SIM.serialize`/`deserialize` preserves all new corpse/soul state fields on `npc`, `W.sect`, or `W.world` (including nested `equip` & `techs`), adding any new top-level `W.*` keys to `knownKeys` (`1463`) or `_saveExtras`; check `inferArchetype`/graveyard interactions (`1125`, `1618`). |
| **`js/render.js`** | Add each path to `PATH_COL` (`451`), `R.PATH_VISUAL_SIGNATURES` (`1692`), aura switch (`6221-6485`), `pMap` (`10563`), and render **visibly distinct Canvas ascendant crown shapes** (`apexCrownShape`) so `signature_vfx_catalog_browser_audit.js` pixel-hashes stay 100% unique! Render corpse thrall / soul spirit units visibly on battlefield canvas. |
| **`js/ui.js`** | **Read-only** NPC inspector details showing bound Corpse Thralls (name/species, inherited skills, equipped WEAPON/ARMOR/ACCESSORY) & Bound Souls, plus Thai path map (`PATH_NAMES` if duplicated in `ui.js`). Zero control buttons! |

---

## 5. Hard-Coded Count Assertions to Update (PRE-MAPPED)

Existing tests currently assert `55` paths and `346` subpaths (`+43` / `16` keywords). Update these assertions dynamically (e.g., to match `Object.keys(CULT.PATHS).length` / exact new counts) when adding the new paths:

1. `GAME_SOURCE/tools/validate_data_schema.js:187` (`majorPaths.length === 55`)
2. `GAME_SOURCE/test/legendary_dao_v370_suite.js:13,14` (`55`, `346`)
3. `GAME_SOURCE/test/p2_polish_v370c_suite.js:22` (`55`)
4. `GAME_SOURCE/test/signature_vfx_catalog_browser_audit.js:74` (`55`)
5. `GAME_SOURCE/test/v200_jianghusect2_grand_dao_epoch_suite.js:85,138,139,141` (`55`, `346`)
6. `GAME_SOURCE/test/v210_grand_dao_debates_and_bugfix_audit_suite.js:57,78,100,122,123` (`55`)
7. `GAME_SOURCE/test/v220_cosmic_pantheon_shinobi_and_manual_lifecycle_suite.js:125,126,128` (`55`, `346`)
8. `GAME_SOURCE/test/v230_grand_dao_deep_parity_and_universal_arsenal_suite.js:39,142` (`55`)
9. `GAME_SOURCE/test/v234_massive_content_and_composable_mechanics_suite.js:175,306,307` (`55`, `346`)
10. `GAME_SOURCE/test/v235_comprehensive_mechanics_and_elemental_fusion_suite.js:304` (`55`)
11. `GAME_SOURCE/test/v240_composable_keywords_and_tactical_combat_suite.js:39` (`16` keywords if adding new `KW_*` to `COMBAT.KEYWORDS_CATALOG`)
12. `GAME_SOURCE/test/v250_pathbound_visuals_suite.js:133,135` (`55`)
13. `GAME_SOURCE/test/v260_bugfix_category_13_suite.js:23,71` (`55`, `346`)
14. `GAME_SOURCE/test/v260_prose_naming_and_lore_canon_suite.js:109,118` (`43`, `346`)
15. `GAME_SOURCE/test/v270_paths_subpaths_part2_parity_and_autonomy_suite.js:13` (`55`)
16. `GAME_SOURCE/test/v340_combat_depth_and_duet_synergies_suite.js:50` (`55`)
17. `GAME_SOURCE/test/v500_celestial_visual_overhaul_suite.js:122` (`55`)
18. `GAME_SOURCE/test/weapon_subpath_gear_expansion_suite.js:25,38` (`55`, `346`)
19. `GAME_SOURCE/test/resonance_tactics_assembly_suite.js:50` (`346`)

---

## 6. Required New Test Suite & Verification Gate

Create a dedicated regression suite (e.g. `GAME_SOURCE/test/necro_paths_v397_suite.js`, and add to `GAME_SOURCE/test/run_all.js`) verifying:
1. All >= 3 Necro Paths + >= 4 Subpaths each exist in `CULT.PATHS`, `PATH_DESCRIPTORS`, `PATH_GAUGES`, `CULT.TRACKS`, `SECT.ARCHETYPES`, `NINE_DAO_PAGODA`, `PATH_VISUAL_SIGNATURES`, and `Render` crowns; zero English parentheticals in `nameTh`; Tier-7 legendary & valid mantras present.
2. **Corpse Control (NPC & Beast):** Capturing real fallen NPC/Beast -> retaining body & original moves -> equipping real `WEAPON`/`ARMOR`/`ACCESSORY` -> `STATS` reflects equipped gear -> deploys & fights in `COMBAT` -> persists cleanly (with zero item dupe/loss).
3. **Soul Control:** Incorporeal soul mechanics behave strictly differently from physical corpses (no physical gear equipping, distinct soul effects/combat behavior, closed-loop capture).
4. **3rd+ Necro Path:** Distinct unique mechanic works end-to-end in combat & simulation.
5. **AI Autonomy + Observer Purity + Save/Load:** NPCs autonomously harvest/equip/command without player triggers; zero forbidden UI buttons; `SIM.serialize`/`deserialize` preserves corpses (with gear & skills) and souls; `HC.FINGERPRINT === '155:2f9c9dd7'`; `AGENTS.md` unchanged.

**Final Gate Commands (run from `GAME_SOURCE/`):**
- `node tools/validate_data_schema.js` (MUST exit 0, Errors: 0)
- `node test/necro_paths_v397_suite.js`
- `node tools/run_parallel_tests.js` (check all updated suites + `v270`/`v370`/`v390..v396`/`v240`/`v250`/`v260` + syntax pass cleanly)
- `node tools/build_single.js`
- Verify SHA-256 locks on `AGENTS.md` and `GAME_SOURCE/js/human_core.js`.
