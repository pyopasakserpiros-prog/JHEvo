---
name: progression-design
description: Structure, extend, and balance JianghuSect Evolution v2.0.16 progression - 12 Major Cultivation Paths (XIAN, BODY, GOD, DEMON, HEART_SOUL, MECH_PUPPET, KARMA_SAMSARA, BEAST_SOVEREIGN, SAGE_SUPPORT, CRAFT_CREATION, ARRAY_TALISMAN, STRATEGY_GOVERNANCE), 96 Subpaths, path selection (CULT.choosePath), Stage Equivalence (4/5/8/9-stage scales), 69 Specialization Tracks, Heavenly Tribulation & Ascension, 12-Floor Nine-Dao Pagoda, Elemental Realms, Bottlenecks, Retraining, and Spirit Beast lifecycle (js/cultivation.js, js/explore.js, js/sect.js).
origin: jianghusect-custom
category: cultivation-progression
---

# JianghuSect Progression (v2.0.16): 12 Paths, 96 Subpaths, Stage Equivalence, Tracks, Ascension & Pagoda

## Purpose
Source-verified progression spec for `GAME_SOURCE/js/cultivation.js`, `js/bottleneck.js`, `js/retraining.js`, `js/sect.js`, `js/explore.js`, `js/expedition.js`, `data/data_cult.js`, `data/data_martial.js`.

Use when touching: major paths / subpaths / tracks, path choice scoring, stage equivalence, tribulation & ascension, Pagoda / Elemental Realms, spirit beasts, bottlenecks, retraining, `SECT.ARCHETYPES`.

> **Never hard-code counts.** Enumerate at runtime: `CULT.PATH_IDS` (12 ids), `CULT.PATHS[id].subPaths`, `CULT.TRACKS`, `EX.NINE_DAO_PAGODA.floors.length`. Counts below are the verified v2.0.16 snapshot (`validate_data_schema.js`: 533 items, 917 recipes, 331 arts, Errors 0).

---

## 1. The 12 Major Paths (`CULT.PATH_IDS`, `JD.CULT.paths`)

| Path ID | Max stage | Element | Subpaths | Subpath IDs |
| :--- | :---: | :--- | :---: | :--- |
| `XIAN` | 9 | WIND | 13 | SWORD_IMMORTAL, FIVE_ELEMENTS, ELIXIR_DAO, ASTRAL_ARRAY, BLOOD_DEMON, PHANTOM_SOUL, TIME_VOID, SOUND_ZITHER, YIN_YANG_HARMONY, FROST_MOON_IMMORTAL, STAR_ARCHER, CLOUD_DRAGON_SPEAR, PURE_SWORD_SAINT |
| `BODY` | 5 | EARTH_METAL | 13 | TIGER_SOVEREIGN, BLOOD_DRAGON, VAJRA_BODHI, DEVOURING_FIEND, SOLAR_FORGE, THUNDER_BODY, JADE_IMMORTAL_BODY, TITAN_MOUNTAIN_BODY, WOOD_SPRING_BODY, STAFF_GUARD, WAR_SPEAR_SOVEREIGN, IRON_BOW_SENTINEL, OVERLORD_HEAVY_BLADE |
| `GOD` | 4 | LIGHT_YANG | 10 | WAR_DEITY, MERCY_DEITY, FATE_ORACLE, TOTEM_BEAST_GOD, UNDERWORLD_JUDGE, OCEAN_SOVEREIGN, HARVEST_EARTH_GOD, MEDICINE_BODHI_GOD, SUN_BOW_DEITY, GOLDEN_ARHAT_STAFF |
| `DEMON` | 9 | YIN_SHADOW | 7 | SHADOW_ASSASSIN, VENOM_GU_SOVEREIGN, NETHER_GHOST_KING, HEAVEN_DEVOURING_DEMON, SHADOW_ARCHER, BLOOD_SPEAR_ASURA, ASHURA_SLAUGHTER_BLADE |
| `HEART_SOUL` | 9 | LIGHT_YANG | 7 | ZEN_VOID_MIND, CALLIGRAPHY_PAINTING_SAGE, DREAM_ILLUSION_WEAVER, MIND_SWORD_TELEKINESIS, ZITHER_HEART_BOW, HEART_BLADE_MEDITATION, VOID_SPEAR_MIND |
| `MECH_PUPPET` | 8 | EARTH_METAL | 7 | HEAVENLY_GOLEM, THOUSAND_THREAD_ASSASSIN, BEAST_CHIMERA_MECH, CELESTIAL_BALLISTA, SOUL_VESSEL_AVATAR, FLYING_BLADE_ORBITER, ASTRAL_CLOCKWORK_PRIME |
| `KARMA_SAMSARA` | 8 | LIGHT_YANG | 7 | REVERSED_RETRIBUTION, SIX_PATHS_WHEEL, FATE_SEVERING_THREAD, LOTUS_MERCY_PURIFIER, ASURA_JUDGMENT_BLADE, PAST_LIFE_MIRROR, BODHI_VOW_GUARDIAN |
| `BEAST_SOVEREIGN` | 8 | WOOD_LIFE | 7 | MYRIAD_BEAST_PACK, PRIMORDIAL_BLOOD_MUTATOR, SYMBIOTIC_BEAST_WARRIOR, COLOSSUS_SHIELD_TAMER, SWARM_GU_HIVE_MASTER, CELESTIAL_ASTRAL_FAIRY_TAMER, ABYSSAL_DRAGON_TOTEM |
| `SAGE_SUPPORT` | 8 | WOOD_LIFE | 7 | GOLDEN_NEEDLE_SAINT, CELESTIAL_ZITHER_ENVOY, DIVINE_NECTAR_APOTHECARY, QIMEN_TALISMAN_PATRON, SOUL_LANTERN_SHEPHERD, WAR_BANNER_CHORISTER, WOOD_SPIRIT_SYMBIONT |
| `CRAFT_CREATION` | 8 | FIRE | 9 | PILL_FURNACE_IMMORTAL, POISON_VENOM_CAULDRON, HEAVENLY_ANVIL_SMITH, SPIRIT_SWORD_ARTIFICER, RUNE_ARRAY_ENGRAVER, DIVINE_FLAME_SMELTER, SPIRIT_FEAST_HEALER, JADE_MEAL_PREPARER, CELESTIAL_ARMOR_ARTISAN |
| `ARRAY_TALISMAN` *(v2.0.14)* | 8 | ASTRAL | 4 | EARTH_VEIN_WARDEN, SEAL_SCRIPT_EXORCIST, THUNDER_TALISMAN_ADEPT, MIRAGE_ARRAY_WEAVER |
| `STRATEGY_GOVERNANCE` *(v2.0.14)* | 8 | LIGHT_YANG | 5 | BATTLEFIELD_STRATEGIST, SECT_STEWARD, DIPLOMATIC_ENVOY, CARAVAN_QUARTERMASTER, CIVIL_TEACHING_MENTOR |

Total = **96 subpaths**. Old 9-path numbers (78 subpaths) are obsolete.

### 1.1 Path-overlap boundaries (do not merge)
- `CRAFT_CREATION.RUNE_ARRAY_ENGRAVER` = **artisan**: inscribes arrays/runes onto gear (arts `INNATE_RUNE_ARRAY_AEGIS`, `ART_CRAFT_005`, `ART_CRAFT_011`).
- `ARRAY_TALISMAN` = **battlefield/defense specialist**: own arts `ART_V214_<SUB>_T1/_T4`, `INNATE_V214_<SUB>`, `PASS_V214_<SUB>`; brush arts `TECH_V215_BRUSH_*` attach to SEAL_SCRIPT_EXORCIST / THUNDER_TALISMAN_ADEPT.
- Broad existing craftsmen remain generalists. Existing crafting IDs, six original crafting subpaths and saved NPC investments must keep working.
- **No office is reserved to any path** (Sect Master, offices, succession stay path-agnostic; paths only grant bounded bonuses).

---

## 2. Path & Subpath Selection (`js/cultivation.js` ~1700–1763)
1. `CULT.pathScores(npc, bias)` – scores every `(path, sub)` pair: per-path base formula from observable HC traits/affinities/aptitudes (e.g. `ARRAY_TALISMAN` = `(ARRAY+TALISMAN affinity + spatial + focus)*0.2 + comprehension*0.4`; `STRATEGY_GOVERNANCE` = `(planning+judgement+leadership+interests.leading)*0.2 + aptitudes.command*0.4`), plus `SUBPREF` affinity/personality weights, `ELEM.resolveCompatibility(…,'SUBPATH_SELECT')*0.28`, root bonuses (FIVE_ELEMENTS needs ≥3 roots; YIN_YANG_HARMONY needs LIGHT_YANG+YIN_SHADOW roots), and `MARTIAL.pathSkillAffinity`. Cached by `npc._ver`, `_pathSkillVersion`, path/sub/stage.
2. `CULT.majorPathScores` – **one best candidate per major path** (extra subpaths cannot buy extra lottery tickets; no top-6 cutoff).
3. `CULT.choosePath(npc, rng, bias)` – picks major path via `rng.weighted(exp((score-top)/9))`, then a branch inside it via `exp((score-major)/7)`.
- Legacy affinity aliases: `BOW→SWORD`, `STAFF→SPEAR`, `ASTRAL→SCRIPTURE` (real HC keys only). Old sub IDs resolve via `CULT.SUB_ALIASES`/`CULT.resolveSubId`.
- Equal viability is **not** a population quota; don't add per-path tickets.

---

## 3. Stage Equivalence Contract (NEVER compare raw `cult.stage` across paths)
Native scales: `GOD` 4, `BODY` 5, XIAN/DEMON/HEART_SOUL 9, all other paths **8**.

`CULT.majorStageEquivalent(path, stage)` maps to the canonical 1..9 scale (fractional stages interpolate):
- `BODY`: `[1, 2.5, 4.5, 6.8, 9]`
- `GOD`: `[1, 3.2, 6.2, 9]`
- any 8-stage path: `[1, 2.1, 3.2, 4.4, 5.5, 6.7, 7.8, 9]`

Functions: `CULT.normalizedStage(npc)` (same map), `CULT.equivalentStage(entity)` (max with track equivalent), `CULT.trackEquivalentStage(sub, ordinal)`, `CULT.effectiveTechStage(npc)` (gear/arts/crafting gates: BODY `[1,2,4,6,7]`, GOD `[1,3,5,7]`, 8-stage `[1,2,3,4,5,6,7,7]`, else raw; always `max` with raw stage and track ordinal), `CULT.worldRank(npc)`, `CULT.maxStage(npc)`.
- Generic NPC pill choice, precombat eligibility, cross-path appointment/recruitment merit use **equivalent realm**; native path-specific breakthrough pills keep exact `path:stage` requirements.
- Terminal specialization of every subpath maps to equivalent realm 9.

---

## 4. Specialization Tracks (`CULT.TRACKS`, 69 entries; `CULT.ADVANCED_TRACKS`, 27)
- Track def (`CULT.trackDef(sub)`): `{subPath, trackId, sourceMajorPath, targetMajorPath, targetMajorStages, majorPowerMapping[9], mode:'INDEPENDENT_TRACK', realms[9]}`; each realm has `ordinal, lifespanMax, functionalCombatPower, majorBandEquivalent, skillGate{primarySkill,minPrimarySkill,secondarySkill,…}`.
- v2.0.14 added **12 nine-ordinal tracks** (new paths + 3 crafting branches). New paths use 8 native stages with canonical realm equivalence.
- Lifecycle API: `CULT.initTrack/awakenSpecializationTrack/ensureTrack/trackRealm/trackThreshold/trackReady/checkTrackGates(W,npc,targetOrd)/trackBreakthroughChance/trackBreakthrough(W,npc,opts)/trackFunctionalPower`. Daily check lives in `SIM.dailyUpdate`.
- Skill changes must invalidate path-score and cultivation-rate caches (`npc._pathSkillVersion`).

---

## 5. 14 Starting Sect Archetypes (`SECT.ARCHETYPES`, `SECT.ARCHETYPE_WEAPON`)
`sword, blade, spear, fist, alchemy, bow, staff, focus` + dedicated `god, demon, mech, karma, beast, sage`. `ARCHETYPE_WEAPON[key] = {family, skill, starterWeapon, masterWeapon}`; Master gets `masterWeapon` skill 70 (×1.15), founding elders `starterWeapon` skill 35. (No starter archetype yet for CRAFT/ARRAY/STRATEGY – verify `SECT.ARCHETYPES` before assuming.)

---

## 6. Strategy & Governance Bonuses (`SECT.governanceSummary/governancePractice`, `GOVERNANCE_ROLES`)
- Result `{upkeepReduction, constructionSpeedBonus, logisticsEfficiency, contributors}`; caps: **upkeep ≤ 8%**, **construction ≤ 12%**, **provision loss ≤ 20%**; diplomacy envoys add **≤ +2 attitude** (only actual participants, no stacking).
- Per role, candidates = post holder (or valid delegate when absent) → Master → Deputy; only **strongest qualified** contributor counts (primary skill ≥ 25), never per-head stacking. `STRATEGY_GOVERNANCE` specialists get ×1.05, +0.10 when `sub.governanceRole` matches (`logistics`→mission/provision, `steward`→treasury).
- `governancePractice(W,n,role)` trains primary 0.35 / secondary 0.15 skill only for appointed/delegated duty, 120-min cooldown (`n.governancePracticeAt`), saved.
- Other paths can hold every office; strategists need none.

---

## 7. Spirit Beasts, Breeding, War-Beasts & Mounts (`js/cultivation.js`, `js/expedition.js`)
- Pet object: `{uid, speciesId, nameTh, family, role, tier 1..7, level 1..9, element, bloodlineTrait, purity, bond, loyalty, fatigue, hunger, hp, hpMax, active, sovereignAwakened}`; stores `npc.pets`, `W.sect.beasts`/`menagerie`, `gateBeasts`, `reservePets`.
- `CULT.maxActivePets(npc)` 1 general, 2–4 for BEAST_SOVEREIGN by equivalent stage; `CULT.breedBeasts(W,A,B,opts)` (boosted by `specialistFacilities.beast_menagerie.level`); `CULT.awakenBloodline`, `CULT.evolvePet`, `CULT.feedPet`, `CULT.bindPet`.
- War-beasts in `W.sect.gateBeasts` fight during raids; `MOUNT_CHARGER`/AVIAN/UNGULATE act as mounts in `EXPED.createParty` (travel −25%, loot capacity +40%).
- Summoned helpers inherit bounded caster stats (not mortal foe power 20).

---

## 8. Nine-Dao Pagoda — 12 Floors (`EX.NINE_DAO_PAGODA`, `js/explore.js` ~7549)
Despite the name there are **12 floors**, one per major path (all paths enter any floor; no path lockout):

| F | Path | basePower | stones | F | Path | basePower | stones |
| :-: | :--- | :-: | :-: | :-: | :--- | :-: | :-: |
| 1 | XIAN | 110 | 45 | 7 | KARMA_SAMSARA | 395 | 110 |
| 2 | BODY | 145 | 55 | 8 | BEAST_SOVEREIGN | 460 | 125 |
| 3 | GOD | 185 | 65 | 9 | SAGE_SUPPORT | 530 | 150 |
| 4 | DEMON | 230 | 75 | 10 | CRAFT_CREATION | 600 | 175 |
| 5 | HEART_SOUL | 280 | 85 | 11 | ARRAY_TALISMAN | 675 | 195 |
| 6 | MECH_PUPPET | 335 | 95 | 12 | STRATEGY_GOVERNANCE | 750 | 215 |

- Reward set per floor: `RES_NINE_DAO_<PATH>` resonance set; `EX.pagodaSetPieces(path, day)` mints 3 tier-5 pieces (`uid 'PAGODA_<PATH>_<SLOT>'`, `combatMult 1.12`, `defMult 1.08`); track unlocked sets in `W.world.nineDaoPagoda.unlockedSets`.
- API: `EX.departNineDaoPagoda(W, party, {maxFloor})` → `EX.createTrialExpedition(kind 'nine_dao_pagoda', 1.5 days)`, `EX.resolveNineDaoPagoda`, `EX.ensureTrials` (state: `W.world.nineDaoPagoda{runs,unlockedSets,history}`, `W.sect.daoInsights`).
- New path ⇒ add a floor **and** `RES_NINE_DAO_<PATH>` set, or rewards break.

### 8.1 Elemental Realms (`EX.ELEMENTAL_REALMS`, 5)
`REALM_METAL/WOOD/WATER/FIRE/EARTH` (basePower 180–200, 3 floors each `basePower*(1+(floor-1)*0.34)`), **rotating every 90 days**: `EX.elementalRealmAt(day) = REALMS[floor(day/90) % 5]`; only the current realm may be entered. Resonant element match via `EX.matchedRealmElement` (EARTH_METAL is the canonical shared Earth/Metal root). `EX.departElementalRealm`, `EX.resolveElementalRealm`.

---

## 9. Heavenly Tribulation & Ascension (`SECT.*CelestialTribulation`, `js/sect.js` ~4287)
- Qualify at `CULT.maxStage(npc)` with equivalent stage 9 (never hard-code 8/9). Begin from the Ancestral Shrine: `SECT.canBeginCelestialTribulation`, `SECT.beginCelestialTribulation`; state `W.sect.celestialTribulation{active,history≤50,sequence}`.
- Constants: stone cost **500**, retry cooldown **90 days** (`ascensionCooldownUntilDay`), helper cap **3**, saved 3-day preparation. Helpers by `tribulationRole`: `healer` (SAGE_SUPPORT/healer post/healing subs), `guardian` (BODY/BEAST_SOVEREIGN), `array` (MECH_PUPPET/CRAFT_CREATION/array & talisman subs or ARRAY≥35 / TALISMAN≥40), else `support`; one of each role first, then power.
- Optional recovery pills: `P:REC190_PILL_004`, `P:REC190_PILL_003`, `P:REC140_ALC_JADE_MARROW_2`.
- Success: inscribe ascended legacy tablet (`tablet.ascended`), `cult.ascended`, `ascendedLegacyCount++` → permanent sect cultivation `SECT.ascensionCultivationMultiplier = 1 + min(5,count)*0.01` (cap +5%), retire cultivator (not death). Failure: recoverable, `ascensionAttempts++`.
- Resolve participants by saved IDs; release survivors on every outcome; if ascendant is Sect Master, finish succession **before** `SIM.retire`.

---

## 10. Bottlenecks & Retraining
`js/bottleneck.js` (`BN.chanceMod`, `BN.daily`, tribulation-failure wounds) and `js/retraining.js` (cross-sect manual/foundation retraining) consume `CULT.PATHS`; breakthrough pills with `effect.btFor{path,stage}` require exact native path/stage.

---

## 11. Extending Checklist (new path / subpath)
1. Add path to `JD.CULT.paths` (stages array length = `maxStage`), `elementProfile`; register in `CULT.PATHS`/`PATH_IDS`.
2. Add `base[path]` formula in `CULT.pathScores`, `SUBPREF`, maxStage map in `majorStageEquivalent`/`effectiveTechStage` (new stage-count scales need explicit maps).
3. Add track (`registerTracks`), arts/innate/passive/mantra, resonance set `RES_NINE_DAO_<PATH>`, Pagoda floor + `EX.pagodaSetPieces`, UI path catalogs (fixed catalogs previously missed new paths), stat/profile integration.
4. Never edit `js/human_core.js` (`HC.FINGERPRINT === '155:2f9c9dd7'`); keep exactly 40 script tags.

## 12. Verification
```bash
cd GAME_SOURCE
node tools/validate_data_schema.js          # Errors must be 0
node test/martial_paths.js && node test/demon_heartsoul_paths.js
node test/bottleneck.js && node test/specialization_tracks.js && node test/martial_retraining.js
node test/successor_and_archetypes_suite.js
node test/v208_paths_and_beast_pets_suite.js && node test/v209_facilities_party_synergy_suite.js
node test/v210_pagoda_warbeasts_conference_suite.js && node test/v211_tribulation_ascension_suite.js
node test/v214_content.js && node test/v214_governance.js && node test/v214_path_selection.js && node test/v214_professions.js
node test/run_all.js                         # browser suites need local Chromium
```
Known baseline: `skill_visual_browser, browser_mobile_perf, input_cancellation, startup_ui, outside_visual_browser, inventory_grid_ui_suite, fishing_river_suite` fail in Termux headless (no Chromium) — environmental, not regressions.
