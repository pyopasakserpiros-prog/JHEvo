---
name: progression-design
description: Structure, extend, and balance JianghuSect Evolution v2.0.17 progression - 12 Major Cultivation Paths (XIAN, BODY, GOD, DEMON, HEART_SOUL, MECH_PUPPET, KARMA_SAMSARA, BEAST_SOVEREIGN, SAGE_SUPPORT, CRAFT_CREATION, ARRAY_TALISMAN, STRATEGY_GOVERNANCE), 96 Subpaths, path selection (CULT.choosePath), Stage Equivalence (4/5/8/9-stage scales), 69 Specialization Tracks, Heavenly Tribulation & Ascension, Mentorship & Sect Heritage Arts (SECT.MENTORSHIP), Living Jianghu & Karma Bonds (SECT.JIANGHU), 12-Floor Nine-Dao Pagoda, Elemental Realms, Bottlenecks, Retraining, and Spirit Beast lifecycle (js/cultivation.js, js/explore.js, js/sect.js).
origin: jianghusect-custom
category: cultivation-progression
---

# JianghuSect Progression (v2.0.17): 12 Paths, 96 Subpaths, Stage Equivalence, Tracks, Ascension, Mentorship & Living Jianghu

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
- **v2.0.17 Success Modifiers**:
  - `imprintBonus`: `+0.04` if candidate has `mentorImprint`.
  - `relicBonus`: `+0.025` for 2-piece / `+0.05` for 3-piece Legendary Relic Resonance (`MARTIAL.evaluateLegendaryRelicResonance`).
  - Pre-ascension Qi transmission: `candidate.apprenticeIds` receives dying-wish / pre-ascension cultivation and inherited techniques (`SECT.MENTORSHIP.transmitQi`) before retiring.
- Success: inscribe ascended legacy tablet (`tablet.ascended`), `cult.ascended`, `ascendedLegacyCount++` → permanent sect cultivation `SECT.ascensionCultivationMultiplier = 1 + min(5,count)*0.01` (cap +5%), retire cultivator (not death). Failure: recoverable, `ascensionAttempts++`.
- Resolve participants by saved IDs; release survivors on every outcome; if ascendant is Sect Master, finish succession **before** `SIM.retire`.

### 9.1 Mentorship, Qi Transmission & Sect Heritage Arts (`SECT.MENTORSHIP` in `js/sect.js` lines 4494–4843)
- **Direct Disciple Bonds (`MENTORSHIP.formBond(W, mentor, disciple, opts)`)**:
  - Links `disciple.mentorId = mentor.id` and `mentor.apprenticeIds` (`MAX_APPRENTICES: 3`), boosts mutual relation `+25`, and auto-pairs unbonded elders (`rank >= 3` or `eqSt >= 4`) with juniors every 5 days (`MENTORSHIP.daily`).
- **Master Coaching (`MENTORSHIP.coachDisciple(W, mentor, disciple, opts)`)**:
  - Grants `xpGain = Math.round((18 + eqM * 8) * pathBonus)` cultivation XP (`pathBonus = 1.35` if same path), `+8` mastery on a shared technique (`+18` on a mentor-known technique), reduces `heartDemon` by `4`, and applies `mentorGuidance` (`180m`, `+10%` combat stats, `+18%` cultRateBonus, `+8%` btBonus).
- **Qi Transmission (`MENTORSHIP.transmitQi(W, mentor, disciple, opts)`)**:
  - Dying-wish or pre-ascension ceremony granting `surgePts = Math.round((65 + eqM * 32) * (dyingWish || preAscension ? 1.45 : 1.0))` cultivation XP, inheriting the mentor's highest-tier technique at `mastery >= 55`, and writing permanent `disciple.mentorImprint` (`p: { atk/matk/def/mdef: +4% }`, `cultRateBonus: +8%`, `btBonus: +4%`, consumed in `STATS.compute` and `SECT.CELESTIAL_TRIBULATION`).
- **Sect Heritage Art Creation (`MENTORSHIP.synthesizeSectArt(W, creator, opts)`)**:
  - Requires `equivalentStage >= 5` or `rank >= 4`. Synthesizes a dynamic T4–T7 `COMBAT_TECHNIQUE` (`id: 'HERITAGE_SECT_ART_' + seq`, `isSectHeritage: true`) tailored to the creator's equipped weapon (`SWORD`..`WHIP`), path (`command` / `harmonize` / `karmaReversal` / `blink` / `burst`), and primary element, registering it via `CULT.registerDynamicTech` and adding it to `W.sect.library` (`+25%` study speed for all sect disciples).

### 9.2 Living Jianghu, Rumor Tavern & Karma/Nemesis Web (`SECT.JIANGHU` in `js/sect.js` lines 4845–5078)
- **Tavern Rumors (`JIANGHU.refreshTavernRumors`, `JIANGHU.investigateRumor`)**:
  - Rotates up to `MAX_RUMORS: 6` active rumors across 5 archetypes (`MIRAGE_SANCTUM`, `WANDERING_GRANDMASTER`, `ESCORT_COMMISSION`, `TREASURE_AUCTION`, `NEMESIS_INTEL`), rewarding Spirit Stones, CP, cultivation insight, and T5 crafting materials (`MAT_ZITHER_PHOENIX_HEARTWOOD_5`, `MAT_BRUSH_DRAGON_WHISKER_JADE_5`, `MAT_WHIP_KARMIC_RED_SILK_5`, `MAT_ORE_METEOR_IRON_5`, `MAT_HERB_SNOW_LOTUS_5`).
- **Karma Bonds (`JIANGHU.recordKarmaBond`, `MAX_BONDS: 32`)**:
  - Tracks `SWORN_ALLY`, `BENEFACTOR`, `RIVAL`, and `NEMESIS` bonds in `W.world.jianghu.karmaBonds` and `npc.karmaBonds`.
  - **`JIANGHU.triggerAllyAid`**: Sworn allies/benefactors gift `160` Spirit Stones, `2×` T5 materials, `fervorMight` (`90m`), and `+18` cultivation insight, and deploy up to 2 raid defenders (`ALLY_<raidId>_<seq>`) during sect raids (`js/expedition.js` lines 823–842).
  - **`JIANGHU.triggerNemesisChallenge`**: Resolves a gate duel (`SECT.simulateAssemblyBout`); winning reduces `grudge` (`-55`) and can convert the nemesis into a `SWORN_ALLY` (`affinity: 78`) when `charisma >= 52` or `integrity >= 52`.

---

## 10. Bottlenecks, Active Technique Retention & Retraining
- `js/bottleneck.js` (`BN.chanceMod`, `BN.daily`, tribulation-failure wounds) and `js/retraining.js` (cross-sect manual/foundation retraining) consume `CULT.PATHS`; breakthrough pills with `effect.btFor{path,stage}` require exact native path/stage.
- **Active Technique Pruning & Protected Arts (`CULT.pruneExcessActiveTechs` in `js/cultivation.js` lines 2363–2405)**:
  - Active technique capacity: `CULT.maxTechs(npc) = 2 + Math.round(CULT.normalizedStage(npc))`.
  - When active techniques exceed capacity, excess techniques are evaluated via `CULT.techRetentionScore(npc, t)`:
    - **Absolute Retention Immunity (`score = 1e9`)**: `t.legendary`, `t.isSectHeritage`, and `t.innateOnly` are strictly protected and **NEVER pruned**.
    - Replaceable techniques are scored by `(t.tier || 1) * 120 + (t.power || 0) + subMatch (90) + pathMatch (35) + mastery * 0.8`. Lowest scores are forgotten first.

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

## Patch v2.0.18 Additions: Four-Symbol Mythological Beast Evolution
- **Four-Symbol Awakening (`CULT.FOUR_SYMBOL_BLOODLINES`, `CULT.awakenFourSymbolBloodline`)**:
  - Uses Primordial Elemental Catalysts (`CAT_PRIMORDIAL_METAL`, `CAT_PRIMORDIAL_WOOD`, `CAT_PRIMORDIAL_WATER`, `CAT_PRIMORDIAL_FIRE`, `CAT_PRIMORDIAL_EARTH`) to awaken `AZURE_DRAGON`, `WHITE_TIGER`, `VERMILION_PHOENIX`, and `BLACK_TORTOISE` (Growth Stage 5, Tier 7).

## v2.0.26 lineage history
Real mentor bonds and qi transmissions are recorded in `W.sect.mentorship.history` (maximum 200), with saved names and IDs. `UI.lineageHistory` renders the latest 30 in the log and NPC overview. Existing saves do not fabricate historical events. Reassignment clears old active links and cycles are rejected. Verify `node test/lineage_history.js`.

## v2.0.27 lineage tree and sect chronicle
`UI.lineageTree` renders current and recorded historical mentor relationships, with bounded depth and cycle handling. `SIM.log` saves selected actual milestones in `W.sect.sectChronicle` (max 600); `UI.sectChronicle` filters categories and people and can also display retained older logs. No fabricated old events. Check `test/lineage_chronicle.js` and `test/lineage_chronicle_browser.js`.

## v2.0.28 ancestor profiles
`SECT.inscribeLegacyTablet` snapshots known mentor, disciples, merit and up to 12 real related recorded events in `tablet.profile`; `UI.ancestorProfile` displays the snapshot and linked lineage. Existing tablets without snapshots show only available fields; no events are invented. `test/ancestor_profile.js` covers save/load.
