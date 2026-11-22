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

## 3. Creative Design Mandate (>= 3 Paths, >= 4 Subpaths Each)

Design **>= 3 deeply differentiated Necro Paths** (suggest `maxStage: 8`, matching all Grand Dao paths outside `XIAN`/`DEMON`/`HEART_SOUL`/`BODY`/`GOD`), **>= 4 distinct Subpaths per Path** (e.g., 4–5 each => 12–15 new subpaths total):

### Path 1 — Physical Corpse Control (`ควบคุมศพจริง — NPC & สัตว์อสูร`)
- **Core Distinction:** A controlled Corpse is a **persistent physical body** (`npc.corpseThralls`, capped by stage/comprehension/subpath) harvested from slain **NPCs** or **Slain Spirit Beasts / Bosses (`WILD` / raiders)**.
- **Required Mechanics:**
  - **Retains Original Body Identity:** Carries source tier/physique/element, inherits **corpse techniques** (`skl` derived from fallen NPC's known `cult.techs` / weapon moves OR fallen beast's species natural abilities from `JD.BEASTS`), and **CAN equip real `WEAPON` / `ARMOR` / `ACCESSORY` items** (`thrall.equip` for NPC corpses, or beast talisman/claw-plate/collar accessories or adapted gear for Beast corpses!).
  - **Stats & Combat Integration (`combat.js` + `stats.js`):** Deployable alongside caster in fight (`f.A`/`f.B`, stepping via `C.foeStep` + using `STATS.get(thrall)` that computes stats from corpse base tier + preservation/refinement quality + **real equipped gear via `MARTIAL`/stat sums + corpse `techs`** — NOTE: in `stats.js:1284`, `computeFoe` uses `u.summonStats` statically; give Corpse Thralls a proper live gear+tech stat evaluation or recompute helper so equipped weapons/armor/accessories truly boost ATK/MATK/DEF/MDEF/HP/CRIT/PEN and unlock weapon tactics/procs!).
  - **Persistence vs Destruction:** Thralls persist after battle (unlike temporary `isSummon` deleted at `combat.js:4198`). Maintain corpse preservation/decay/repair (e.g., Yin talismans, preservation Qi, repair during `cultivate`/`duty`), and handle destruction cleanly (drop/recover non-broken gear back to owner or sect stock per durability rules).
- **Suggested 4+ Subpaths:** e.g., Battlefield Corpse-General (multi-thrall NPC formation + tactical gear), Beast-Carcass Refiner (beast/boss corpses + mutated anatomy parts), Living-Jade Coffin Bearer (single apex perfected immortal corpse inheriting full high-tier arts & Legendary gear), Shifting-Bone Chimerist (sutured multi-beast/human grafts).

### Path 2 — Soul Manipulation (`ควบคุมวิญญาณ — แยกขาดจากศพกายภาพโดยสิ้นเชิง`)
- **Core Distinction (Opus to flesh out):** **Incorporeal, bodiless Soul Entities** — CANNOT wear physical weapons/armor/accessories, rely on **Soul Vessel / Soul Banner / Soul Furnace / Mental Sea (`npc.soulBound` / `soulSpirits`)** instead of physical corpses!
- **Distinct Mechanical Pillars (Ideas for Opus to choose/evolve):**
  - Captured remnant souls from fallen foes (`f.slain`, `COMBAT.slay`), tormented battlefield ghosts, or ancient wandering spirit echoes.
  - Combat behavior: Intangibility/high evasion vs physical strikes (`atk` mitigation / phase dodge), **direct soul attacks (`type: 'm'`, bypassing partial physical DEF / draining target Qi / inflicting `soulFractured`/`fear`/`silence`)**, **Hostile Possession / Spirit Disruption** (temporarily hijacking/confusing weak-willed foes or disrupting casting), **Soul-Link Buffing** (merging a sage/martial soul temporarily into caster or allies to lend passive stat/crit/comprehension echoes), or **Autonomous Sect Spirit Lantern Patrol / Archive Divination** out of combat!
- **Suggested 4+ Subpaths:** e.g., Soul-Banner Shepherd (wraith swarm + soul-chill/Qi drain), Possession Medium (temporary enemy control / self-empowering soul-fusion), Memory/Will Extractor (extracts temporary insight/mastery echoes or weakness reads from fallen cultivators' memories), Soul-Lantern Judicator (purifying/reaping souls into astral/yin lantern constructs).

### Path 3 — Third+ Distinct Necro Dao (Opus to Design)
- Make it mechanically distinct from BOTH Path 1 (dressed physical corpses) and Path 2 (incorporeal souls). Strong non-overlapping concepts:
  - **Option A — Revenant Soul-In-Corpse Vessel Alchemy (`หลอมวิญญาณประทับร่างศพ / คืนชีพจักรพรรดิซาก`):** Binds a *Soul* (spirit/beast intent) into a *separately prepared Corpse Vessel*, unlocking cross-resonance when soul element/archetype matches corpse body/weapon (e.g., Sword-Soul inside a Giant Beast/Vajra Corpse!), or burning vessel charges for explosive Awakening bursts.
  - **Option B — Ossuary & Marrow-Relic Necromancy (`วิถีอัฐิธาตุและศาสตรากระดูก`):** Harvests bones/marrow/relic fragments to grow/assemble an evolving external Ossuary Weapon/Armor/Tower (`skeleton carapace`, `bone-blade swarm`, marrow-tempering) and turns battlefield casualties into bone spires/domains.
  - **Option C — Nether Plague, Rot & Life-Death Inversion (`วิถีวัฏจักรเสื่อมสลายและบุปผาซากศพ`):** Turns decay, rot, healing-inversion (`healBlock` / stealing `hot`/regen into DoT), and necrotic spore/blooms on fallen corpses into sustain and AoE attrition.
  - *(Note: Opus may also add a 4th path if inspired, as long as quality/test parity stays 100%.)*

### Weapon, Element, Keywords & Techniques Rules
- **Weapons & Elements (User Explicitly Allows Full Flexibility):**
  - No need to force every path into rigid single-weapon or single-element locks! Use what fits best per path/subpath: e.g., `element: 'YIN_SHADOW'` or `'NEUTRAL'` (`EXPLICIT_NON_ELEMENTAL` / `ROOT_AGNOSTIC_UTILITY`), `weaponTypes: ['ALL']` or multi-weapon lists or `requiresWeapon: false` unarmed/talisman/soul-arts, with optional **synergy bonuses** (`bonusWeapon` / `bonusElement` / `elementProfile`) rather than hard lockouts where appropriate.
- **Keywords & Composable Mechanics:**
  - Can reuse existing `COMBAT.KEYWORDS_CATALOG` (`KW_*`), `COMBAT.COMPOSABLE_ENGINE` actions/triggers, and `SK.ARCH` archetypes **AND/OR create new Necro Keywords & Composable Actions/Statuses** (e.g., `KW_NECRO_THRALL_SYNC`, `KW_SOUL_SEVER`, `KW_CORPSE_HARVEST`, `KW_INCORPOREAL_PHASE`, `KW_VESSEL_RESONANCE`, etc.).
  - **CRITICAL:** If adding to `COMBAT.KEYWORDS_CATALOG`, update `test/v240_composable_keywords_and_tactical_combat_suite.js:39` (currently asserts `kwKeys.length === 16`)! Every new `effectId` MUST be in `CE.IMPLEMENTED_EFFECT_IDS`, every new status MUST be in `SK.STATUS` (`js/skills.js:65`), and every buff MUST be in `STATS.BUFF_CATALOG` (`js/stats.js`).
- **Techniques & Acquisition Sources:**
  - Each path needs: `MP_BASE_<PATH>` (T1), subpath actives (T1–T6), passives, **>= 2 valid Qi Mantras** (finite `.power` & `.cat` so `CULT.bestMantra` succeeds), and **1 Tier-7 Legendary Apex Art (`legendary: true`)**.
  - Add **universal / cross-path Necro-themed techniques (`path: 'ANY'` or broad `compatiblePaths` + bonus synergy for Necro paths)** per user request (*"วิชาเฉพาะ หรือวิชาที่เหมาะแต่ใช้ได้กับทุกวิถี"*).
  - Author **thematic acquisition sources** matching the paths: e.g., `MANUAL_PATH_*` & `CRYSTAL_PATH_*` & `SUBPATH_CRYSTAL_*`, recipes/equipment/relics, tomb/ruin/sect crypt discovery hooks, `EXPED` / `EXPLORE` Nine-Dao Pagoda floors (`RES_NINE_DAO_<PATH>`), `SECT.ARCHETYPES`, and zero orphan materials!

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
| **`js/sim.js`** | Ensure `SIM.serialize`/`deserialize` preserves `npc.corpseThralls` (including nested `equip` & `techs`), `npc.soulVessels`/`soulSpirits`, and world/sect corpse caches cleanly; check `inferArchetype`/graveyard interactions (`1125`, `1618`). |
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
