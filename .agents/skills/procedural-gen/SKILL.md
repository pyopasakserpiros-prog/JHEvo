---
name: procedural-gen
description: Use when changing JianghuSect random equipment, map generation, exploration, trials, fishing or ecology.
origin: jianghusect-custom
category: world-procgen-exploration
---

# JianghuSect Procedural Generation: Random Gear Engine, World, Exploration & Ecology

> **Current baseline 4.0.0 (updated from 2.0.28–3.6.0):** This project-specific skill contains historical material from earlier versions. The targeted corrections below do not certify every older formula or API. Before implementing, verify the relevant behavior against current source and tests; use `project_status_and_ai_onboarding.md` for the current feature inventory and `AGENTS.md` for project rules.

## Purpose
Reference for generated systems in JHEvo: **randomised equipment instances** (`GAME_SOURCE/js/economy.js`), plus dungeons/trials, expeditions, raids, fishing, ecology (`js/explore.js`, `js/expedition.js`, `js/world_map.js`, `js/fishing.js`, `js/wildlife.js`, `js/wild_resources.js`, `js/visitors_clues.js`, `js/external_market.js`). Check historical details against current source.

**Rule #1: never write a new random-drop routine. Call `ECO.rollProceduralGear`.** Authored items (`JD.ITEMS.items`, minted by `ECO.mintGear`) and procedural instances are two parallel equipment systems; only procedural ones carry `procedural:true`, affixes and wear/repair state.

---

## 1. Deterministic PRNG Contract (`U.RNG`, `js/util.js`)
- No `Math.random()` in gameplay/world code. Use `W.rng` (or `new U.RNG(seed)`; `rollProceduralGear` falls back to `spec.rng` → `W.rng` → `U.RNG(spec.seed||'proc_gear')`).
- API: `next()`, `int(min,max)`, `chance(p)`, `pick(arr)`, `weighted(arr, fn)`, `shuffle(arr)`, `gauss(mean, sd)`.
- Generated instances persist concrete rolls (`st`, `affixes`, `nameTh`, `element*`, `q`, `uid`) — **never re-roll on load**.

---

## 2. Procedural Equipment Engine (`js/economy.js`)

### 2.1 Pools & constants (verified v2.0.16, ~lines 1222–1290)
- `ALL_GEAR_TYPES`: `WEAPON` = SWORD, BLADE, SPEAR, FIST, BOW, STAFF, FOCUS, **ZITHER, BRUSH, WHIP** (10); `ARMOR` = HEAVY, LIGHT, ROBE; `ACCESSORY` = RING, NECKLACE, BRACELET, CHARM → **17 types**, each with a template item `ITEM_PROC_<TYPE>` and recipe `REC_PROC_<TYPE>` (`proceduralOut:true`, `minMastery 8`, `facilityLevel 1`, `compatiblePath 'ANY'`).
- `PROC_BASE_SCALE = [28, 62, 130, 270]` (tier 1..4). **Random gear is capped at tier 4** (fixed authored gear goes higher).
- `ALL_ELEMENTS` (11): NEUTRAL, FIRE, WATER_ICE, WIND, EARTH_METAL, WOOD_LIFE, LIGHTNING, LIGHT_YANG, YIN_SHADOW, BLOOD_DEMON, ASTRAL.
- `ECO.PROCEDURAL_POOLS`: `baseForms[type]` (4–5 Thai base names per type), `gradesByTier` (1 Common/สามัญ, 2 Refined/หลอมปราณีต, 3 Rare/ล้ำค่า, 4 Exceptional/ยอดฝีมือ, each with 4 `prefixes`), `elements[el] = {nameTh, tagTh}`, `affixes[12]`.

### 2.2 The 12 affixes (`ECO.PROCEDURAL_POOLS.affixes`)
| id | suffixTh | stat | value rule | allowed slots |
| :--- | :--- | :--- | :--- | :--- |
| `ferocious_atk` | ขย้ำพยัคฆ์ | atk | `scale 0.22` | WEAPON, ACCESSORY |
| `profound_matk` | สะท้อนปราณ | matk | `0.22` | WEAPON, ACCESSORY |
| `bastion_def` | พิทักษ์ผา | def | `0.24` | ARMOR, ACCESSORY, WEAPON |
| `ward_mdef` | กันอาคม | mdef | `0.24` | ARMOR, ACCESSORY |
| `vital_hp` | อายุวัฒนะ | hp | `0.36` | ARMOR, ACCESSORY |
| `lethal_crit` | ผ่าจุดตาย | crit | flat/tier `[2.0,3.4,5.0,6.8]` | WEAPON, ACCESSORY |
| `savage_critdmg` | สังหารเด็ดขาด | critDmg | `[7,12,18,25]` | WEAPON, ACCESSORY |
| `piercing_pen` | ทะลวงเกราะ | pen | `[3.0,5.0,7.5,10.5]` | WEAPON, ACCESSORY |
| `swift_cast` | ร่ายสายฟ้า | cast | `[3.0,5.0,7.5,10.5]` | WEAPON, ARMOR, ACCESSORY |
| `gale_eva` | เร้นเมฆา | eva | `0.16` | ARMOR, ACCESSORY |
| `hawk_acc` | เนตรเหยี่ยว | acc | `0.18` | WEAPON, ACCESSORY |
| `stride_move` | ก้าวท่องลม | move | `[2.5,4.0,5.5,7.5]` | ARMOR, ACCESSORY |
- Value = `flatByTier[tier-1] * rollFactor * (0.9+q*0.1)` or `baseScale * scale * rollFactor`; `rollFactor = 0.88 + rng*0.28`; rounded to 0.1 and **added** onto `st[stat]`.
- Slot gating means armor never rolls atk/crit/pen/acc; weapons never roll hp/mdef/eva/move.

### 2.3 `ECO.rollProceduralGear(W, spec)` pipeline
`spec`: `{slot, gearType, tier, minTier, maxTier, skill, baseQ, element, materialMods, chosenInputs, recipeId, npc, rng, seed, playerSpawned, source}`.
1. **Slot/type:** valid `spec.slot` else `rng.pick`; `spec.gearType` must be in `ALL_GEAR_TYPES[slot]` else random.
2. **Tier:** `tierCap = clamp(spec.maxTier || mods.tierCap || 4, 1, 4)`, `minTier = clamp(spec.minTier||1, 1, tierCap)`. If `spec.tier` absent: `raw = 1 + mods.tierShift + (skill/90)*0.65 + (rng-0.35)*1.15` → rounded, clamped `[minTier,tierCap]`.
3. **Quality:** `baseQ = spec.baseQ ?? 0.88 + rng*0.28 + (tier-1)*0.04`; `q = round(clamp(baseQ + mods.qShift, 0.72, 1.55), 2)`.
4. **Element:** use `spec.element` if valid; else with `mods.elementBiases` (76% chance pick a bias) else uniform over `ALL_ELEMENTS`. **Secondary** element (≠primary, ≠NEUTRAL): with biases → 45% chance of `biases2[0]`; without → 22% if tier≥3. Profile: NEUTRAL → `{mode:'EXPLICIT_NON_ELEMENTAL'}`; one element → `{mode:'SINGLE', weights:{p:1}}`; two → `{mode:'DUAL', weights:{p:0.7, s:0.3}}`.
5. **Affix count:** `clamp(1 + (tier≥3) + (rng < 0.18 + affixShift*0.65 + (tier===4?0.35:0)), 1, 3)`; each pick = `rng.weighted` over slot-allowed unused affixes, weight `1 + 2.6` if `mods.statBiases` contains the stat (or `'all'`).
6. **Stats (`st`):** `baseScale = PROC_BASE_SCALE[tier-1]*q`. WEAPON: primary `atk` = `baseScale*(0.54..0.62)` and `matk` = `*(0.12..0.17)`; **only `FOCUS` swaps them** (matk primary) — ZITHER/BRUSH/WHIP currently roll physical-primary (design note, tune if casters feel weak). ARMOR: `def` (HEAVY .62 / LIGHT .46 / ROBE .38), `mdef` (ROBE .44 else .28), `hp = baseScale*(0.48..0.56)`. ACCESSORY: `hp .28, atk .14, matk .14`. Then **typed bonus** by `gearType` (e.g. SWORD `crit 2.5+0.5t, acc`, BLADE `critDmg`, SPEAR `pen`, HEAVY `def, move -3`, LIGHT `eva, move +4`, ROBE `mdef, cast`, RING `crit, pen`, NECKLACE `hp, def`, BRACELET `cast, acc`, CHARM `mdef, eva`; ZITHER/BRUSH/WHIP/… have none yet), then affixes; all rounded 0.1.
7. **Multipliers:** `combatMult = (0.052 WEAPON | 0.016 ARMOR | 0.018 ACC) * tier * q * (1 + affixes*0.03)`; `defMult = (0.052 ARMOR | 0.014 WEAPON | 0.016 ACC) * …` (same formula).
8. **Thai name:** `baseForm + gradePrefix + 'แห่ง' + elTag` (+ `'ผสาน' + secondary.nameTh` for dual; `elTag = element.tagTh`) `+ '·' + firstAffix.suffixTh`. Example: `พู่กันปราชญ์วาดเมฆาปราณควบแน่นแห่งอสนีคราม·ขย้ำพยัคฆ์`.
9. **Identity & state:** `uid = ECO.nextGearUid(W, 'ITEM_PROC_<TYPE>')` → `uid_<prefix>_<W.sect.gearUidSeq>`; `id='ITEM_PROC_<TYPE>'`, `minStage = tier`, `grade/gradeTh`, `procedural:true`, `dur:100, maxDur:100, repairCount:0, broken:false, retired:false`, `value = round(26*1.92^(tier-1)*q*(1+affixes*0.08))`, `origin{source, day, recipeId, crafterId, materials}`, `playerSpawned` if flagged.
10. **Resonance tagging (tier ≥ 3):** loops `JD.MARTIAL.RESONANCE_SETS` (31 sets); matches when `slots[slot]` includes `gearType` **and** `elementFamily` includes primary element (or `EXPLICIT_NON_ELEMENTAL` for NEUTRAL) → `resonanceSetIds[]`, `resonanceSetId`.

### 2.4 Crafting entry points (forge flow)
- `ECO.resolveCraftMaterials(W, r, opts, npc)`: recipes with `proceduralOut + slotOptions` pick **one option per slot** (`core` ore sets `tierCap` T2–T4, `elementBias`, `statBias`, `qShift`; `secondary` part adds bias/`affixShift`). Selection: `opts.chosenMats[]` (strict if `strictChosen`) else best score = tier fit (+8 if matches NPC's subpath element) + abundance. Returns `{inputs, chosenOptions, materialMods{tierCap,tierShift,qShift,affixShift,elementBiases[],statBiases[],matIds[]}}` — base `tierCap` is 2.
- `ECO.finishCraft(W, npc, r, ctx)` (outType EQUIPMENT + `proceduralOut`) → `rollProceduralGear({recipeId, npc, skill, baseQ:q, materialMods, chosenInputs, source:'forge'})` → `ECO.applyArmorArtisan` → push to `W.sect.gear`. Failed craft returns ~40% of inputs per stack.
- `ECO.previewProceduralCraft(W, recipe, opts, npc)` (UI estimate), `ECO.craftProceduralNow(W, npc, recipe, opts)` (immediate forge: takes inputs, `baseQ = 0.88 + (skill-minMastery)/160 + gauss(0,.05)`, optional `toNpcBag`).
- **Craft transaction safety:** inputs are reserved via `ECO.reserveInputs` → `registerCraft` (`W.sect.craftTransactions{seq, open{}}` with `materialMods` saved in the receipt) and settled once by `settleCraft`; never consume inputs outside this ledger (save/load idempotency).
- `ECO.applyArmorArtisan(npc, gear)`: only for armor specialist subpaths (e.g. CELESTIAL_ARMOR_ARTISAN): `+skill/100*8%` def/mdef and `+round(skill*0.12)` maxDur once (`gear.artisan`).

### 2.5 Durability, repair & retirement (economic sink)
- Wear: `ECO.wearGear(it, amount, W, owner)` — non-procedural gear never drops below 1 dur; procedural at 0 → `broken:true`, and `retired:true` if `maxDur ≤ 20`. Sources: combat hit (`js/combat.js` ~479: attacker weapon `0.28`, defender armor `0.24`, accessory `0.12`, × `serious?1:0.35`, ×0.6 for `CRAFT_CREATION` owners, only procedural & not broken) and hourly in-fight wear `0.5` (`js/sim.js` ~353).
- Repair: `ECO.repairGear(W, gear|uid, stoneId, npc, opts)` with `ECO.REPAIR_STONES` (`ITEM_REPAIR_STONE_1..4`, `maxDurReduction` 25/20/15/10, `minMaxDur` 20, values 18/44/98/215). Repair sets `dur = maxDur = max(20, maxDur - reduction)`, clears broken/retired, `repairCount++`, rejects `already-full`, `dur-above-new-max`, `max-dur-exhausted`. Auto-pick order stone 4→1 (personal bag `inv.mats` first, then sect stock). Idle NPCs auto-repair gear at ≤45% (`js/sim.js` ~360).
- Retirement: `ECO.retireGear` removes the item and returns 1× `MAT_ORE_COLD_STEEL_2` (tier ≥3) or `MAT_ORE_BLACK_IRON_1` to sect stock. `martial.js` gear-suitability multiplies score by durability and returns −∞ for retired items; `cpeco.js` refuses retired gear in distribution.
- Save integrity: `ECO.ensureUniqueGearUids(W)` re-issues duplicate/missing uids, skips `W.sect.soldGearReceipts`, restores `maxDur/dur/repairCount`, re-derives `broken/retired`.

### 2.6 Drop & source map (all call `rollProceduralGear`)
| Source | Where | Parameters |
| :--- | :--- | :--- |
| Forge | `finishCraft`, `craftProceduralNow` | `materialMods`, skill, `source:'forge'` |
| Expedition hunt | `js/expedition.js` ~325 | chance `0.14 + danger*0.03`, `maxTier = danger+1`, `personalLoot:true` |
| Expedition fortune `gear` | `js/expedition.js` ~519 | 65% procedural else `mintGear` ancient; `maxTier = danger+1` |
| Ruin spot | `js/explore.js` ~6890 | 70%, `maxTier = 1+site.lvl` |
| Realm/pagoda gear event | `js/explore.js` ~6925 | `maxTier=p1`, `minTier=p1-1`, `source:'explore:<site>'` |
| Merchants | `js/external_market.js` ~241 | caravan/rare always, others 55%; count 2 for rare else 1; `maxTier` 4/3/2; `minTier` 2 for rare |
| Edit Hub spawn | `js/sect.js` ~3370 (`EDITOR.spawnItem`) | `{slot, gearType, baseQ: quality, playerSpawned:true, source:'editor_spawn'}` → **0 CP when donated** |
- Procedural drops stay ≤ T4; never route legendary/unique weapons through this engine (`VC.LEGENDARY_WEAPONS` = 21 authored, minted via `VC.mintLegendaryWeapon`).

### 2.7 Extension checklist (new gear type / affix / element)
1. Add type to `ALL_GEAR_TYPES`, `PROCEDURAL_POOLS.baseForms`, `JD.MARTIAL.types` (+ `classify`), `typedBase` table, template item `ITEM_PROC_<T>` and `REC_PROC_<T>` (with `slotOptions`).
2. Affix: append to `affixes` with valid `slots`, `scale` *or* `flatByTier[4]`; ensure `STATS.gearStats` consumes the stat key.
3. Element: add to `ALL_ELEMENTS` **and** `PROCEDURAL_POOLS.elements` (else it is filtered out); keep `ELEM` compatibility valid.
4. Keep `uid`, `dur`, `maxDur`, `procedural`, `origin` present; run `test/v213_procedural_equipment_and_review_suite.js`, `weapon_subpath_gear_expansion_suite.js`, `craft_transactions.js`, `save_integrity.js`.

---

## 3. Exploration, Sanctums, Pagoda & Secret Realms (`js/explore.js`)

### 3.1 Spots & cave
- 6 sect spots (`EXPLORE.SPOTS`): `stele, spring, ruin, grove, cave (10 floors, EXPLORE.CAVE_FLOORS), gate (12 worlds, EXPLORE.WORLDS)`.
- `EXPLORE.sampleCaveFloor(floor, rng)`: each floor has 3 pools; samples 1 (or 2 at 55%) pools without replacement, 1 weighted encounter per pool; never leaks unvisited pools.
- `EXPLORE.RANK_FOE_POWER = {1:95, 2:480, 3:2800, 4:18500}` (static calibration, no rubber-banding).

### 3.2 Multi-floor resolution (`EXPLORE.resolveSanctum`, reused by pagoda/realms)
1. `COMBAT.evaluateFormationSynergy(alive)` → `{synergies, powerMultiplier, damageMitigation, reflectPct, auraNamesTh}`.
2. Between floors (`floor>1`) any `SAGE_SUPPORT` member casts free triage `CULT.castHealOrBuff(W, sup, m, {free:true, healPct:0.35, buffKey:'vitalRegen', duration:300})`.
3. Guardian power: `COMBAT.resolveWeaponTactics(lead, guardian, {dist:2.2})`, party power + `MARTIAL.evaluateResonanceSet` bonuses × `tac.dmgMult` × `formSyn.powerMultiplier`.
4. Handover: `X.handover(W, ex, alive, out)` for stones/mats/pills/**gear**/techs/catalysts; release members (`away=false, hidden=false, travel=null, expId=null`); history capped 20 in `W.sect.sanctums.history`.

### 3.3 Nine-Dao Pagoda — **12 floors** (`EXPLORE.NINE_DAO_PAGODA`, ~7549)
One floor per major path (XIAN → BODY → GOD → DEMON → HEART_SOUL → MECH_PUPPET → KARMA_SAMSARA → BEAST_SOVEREIGN → SAGE_SUPPORT → CRAFT_CREATION → ARRAY_TALISMAN → STRATEGY_GOVERNANCE), `basePower` 110 → 750, stones 45 → 215. Any party enters any floor; reward = 3-piece resonance set `RES_NINE_DAO_<PATH>` via `EXPLORE.pagodaSetPieces` (tier-5 pieces with `ownerPath`, `source:'NINE_DAO_PAGODA'`). `EXPLORE.departNineDaoPagoda(W, party, {maxFloor})` (1.5 days). State `W.world.nineDaoPagoda{runs,unlockedSets,history}`. See `progression-design` §8.

### 3.4 Five Elemental Realms (`EXPLORE.ELEMENTAL_REALMS`)
METAL, WOOD, WATER, FIRE, EARTH (basePower 180–200, 3 floors × `*(1+(floor-1)*0.34)`), rotating every 90 days (`EXPLORE.elementalRealmAt(day)`); only the current realm is enterable; matching root (`EXPLORE.matchedRealmElement`) gives bonuses; drops `catalystId` (`ECO.addCatalyst`).

---

## 4. Expeditions, Mount Caravans & Raids (`js/expedition.js`)
- `X.REGIONS` (forest, plains, mountain, desert, water, ruins), `X.MISSIONS` (fortune, hunt, gather, trade, diplomacy, recruit, bounty); the `mission` elder / Master / Deputy approves (`COG.missionBias`, `COG.officeDecision`).
- Mounts (`role MOUNT_CHARGER` or family AVIAN/UNGULATE): travel ×0.75, capacity ×1.40 (`X.createParty`). Strategy envoys add ≤ +2 attitude (see `progression-design` §6).
- Raids: `X.spawnRaid(W, kind, strength)` (`beast|rival|bandit`), `X.rally` (courage/duty/commander leadership), `W.sect.gateBeasts` join defense; `X.raidEnd` callback.
- **Sworn Ally Raid Reinforcements (v2.0.17 - `js/expedition.js` lines 823–842)**:
  - When defending against a raid, active Jianghu Karma Bonds (`SWORN_ALLY` or `BENEFACTOR`) deploy up to 2 sworn allies (`ALLY_<raidId>_<seq>`) with matched weapon types and stats to reinforce the sect gate.

---

## 5. World Map, River Fishing, 21-Relic Trinity & Living Clues (`js/visitors_clues.js`)
- `MAP.W=240, MAP.H=192`; Southern Spirit River with 3 bridges and path-reachable `kind:'fish'` stations.
- `js/fishing.js`: ~90% fish / ~10% container (≈50% trash, ≈49.55% ordinary, ≈0.45% unique legendary); unique pool via `FISHING.buildEligibleLegendaryPool` and `W.world.claimedLegendaries` (strictly non-duplicating; ordinary fallback when exhausted).
- **Universal 21-Relic Trinity (`VC.LEGENDARY_EQUIPMENT` in `js/visitors_clues.js` lines 540–865 - v2.0.17)**:
  - **14 Legendary Weapons (`VC.LEGENDARY_WEAPONS`)**: `LEG_WPN_XUANTIE_HEAVY_SWORD`, `LEG_WPN_YITIAN_SWORD`, `LEG_WPN_TULONG_SABER`, `LEG_WPN_FULL_MOON_SCIMITAR`, `LEG_WPN_XIAOLI_HEART_DAGGER`, `LEG_WPN_DAGOU_JADE_STAFF`, `LEG_WPN_OVERLORD_SPEAR`, `LEG_WPN_OATHBREAKER_DRAGON_LANCE`, `LEG_WPN_WRATHFUL_TIGER_GAUNTLETS`, `LEG_WPN_CONDOR_METEOR_BOW`, `LEG_WPN_PEACOCK_PLUME_FOCUS`, `LEG_WPN_JIUXIAO_PHOENIX_ZITHER`, `LEG_WPN_CHUNQIU_JUDGMENT_BRUSH`, `LEG_WPN_TIANCAN_FATE_WHIP` (covers all 10 weapon types).
  - **3 Legendary Armors (`VC.LEGENDARY_ARMORS`)**: `LEG_ARM_CELESTIAL_CRANE_ROBE` (`ROBE`, Tier 7), `LEG_ARM_SHADOW_KIRIN_CUIRASS` (`LIGHT`, Tier 7), `LEG_ARM_IMMORTAL_TORTOISE_PLATE` (`HEAVY`, Tier 7).
  - **4 Legendary Accessories (`VC.LEGENDARY_ACCESSORIES`)**: `LEG_ACC_SAMSARA_KARMA_RING` (`RING`, Tier 7), `LEG_ACC_BODHI_STARLIGHT_BEADS` (`NECKLACE`, Tier 7), `LEG_ACC_TAICHI_HEAVEN_SEAL` (`CHARM`, Tier 7), `LEG_ACC_DRAGON_PHOENIX_BANGLE` (`BRACELET`, Tier 7).
  - **Relic Star Attunement (`attunedStars` 1–3 ★)**: Refining a Legendary Relic or T6+ gear via `ECO.refineGearWithCatalyst` unlocks `1★` (`q >= 1.48`), `2★` (`q >= 1.62`), and `3★` (`q >= 1.75`), scaling 2/3 and 3/3 Trinity Resonance (`starScale = 1 + stars * 0.03`).
  - **84 Canonical Fixed Weapons & 9 Materials (`data/data_martial.js` lines 45920–46180)**: `EQ_V215_ZITHER_01_T1`..`28_T7`, `EQ_V215_BRUSH_01_T1`..`28_T7`, `EQ_V215_WHIP_01_T1`..`28_T7` (4 weapons per tier T1–T7 for each type) + `REC_V215_*` recipes and 9 specialized crafting materials (`MAT_ZITHER_PARASOL_WOOD_1`, `MAT_ZITHER_ICE_SILK_STRING_3`, `MAT_ZITHER_PHOENIX_HEARTWOOD_5`, `MAT_BRUSH_SPIRIT_WEASEL_HAIR_1`, `MAT_BRUSH_STARLIGHT_CINNABAR_3`, `MAT_BRUSH_DRAGON_WHISKER_JADE_5`, `MAT_WHIP_IRON_SILKWORM_THREAD_1`, `MAT_WHIP_SHADOW_PYTHON_TENDON_3`, `MAT_WHIP_KARMIC_RED_SILK_5`).
  - **62 Living Clue Templates (`VC.CLUE_TEMPLATES`)**: Living clue rumors dynamically generate across the Jianghu tavern and wandering visitors, leading to legendary discovery expeditions.
- Wildlife/resources: `js/wildlife.js`, `js/wild_resources.js` (on-map spawn integrity, ecology).

---

## 6. Verification
```bash
cd GAME_SOURCE
node tools/validate_data_schema.js     # Errors 0 (v2.0.16: 533 items, 917 recipes, 331 arts)
node test/v213_procedural_equipment_and_review_suite.js
node test/weapon_subpath_gear_expansion_suite.js
node test/craft_transactions.js && node test/save_integrity.js
node test/explore.js && node test/exploration_replay.js && node test/cave_pools.js
node test/v210_pagoda_warbeasts_conference_suite.js
node test/visitors_clues_weapons_suite.js && node test/legendary_spawn_gate.js
node test/fishing_river_suite.js && node test/wild_resources.js && node test/wildlife_batches.js && node test/onmap_wildlife.js
```
Browser-based suites need local Chromium (fail in headless Termux — environmental).

## Patch v2.0.18 Additions: 5-Region World Map Topology & Timed World Anomalies
- **5-Region Topological Node Network (`EXPED.WORLD_REGIONS`, `EXPED.ensureWorldTopology`)**:
  - `CENTRAL_HEARTLAND`, `NORTHERN_PEAKS`, `SOUTHERN_WATERS`, `EASTERN_PLAINS`, `WESTERN_BADLANDS` with connected routes (`EXPED.WORLD_ROUTES`) and 8 canonical neighbor sects (`EXPED.CANONICAL_SECTS`).
- **Timed Serendipitous World Anomalies (`EXPED.ANOMALY_TEMPLATES`, `EXPED.spawnWorldAnomaly`)**:
  - `GROTTO_ANCIENT_IMMORTAL`, `BLOOM_CELESTIAL_LOTUS`, `METEOR_ASTRAL_CRATER` with rival sect expedition races (`rivalEtaDay`, `rivalPower`).

## World atlas v2.0.24
- The outdoor atlas is built from `EXPED.ensureWorldTopology(W)` by `UI.buildWorldAtlas(W)`. Do not create parallel world ownership or consume RNG while drawing it.
- Fortune sites, secret-realm sites and wandering legends have only biome/region information in the simulation; their atlas coordinates are deliberately approximate. The dimensional gate is inside the player's sect and leads to separate worlds.
- Selecting a fortune site calls `EXPED.depart(W, party, 'fortune', region, {siteId})`; validate rank and biome before spending resources or RNG. Strategic resource capture uses `EXPED.departResourceClaim`, resolves on arrival, and may fail against defenders. Always settle expired anomalies and return the expedition members.
- The generated terrain is `assets/world_atlas_terrain.jpg`. `tools/build_single.js` embeds it in the standalone file; keep the offline asset test passing.

---

## Patch v3.6.0 – v4.0.0 World Map, Immortal Tombs & Micro-Locations Additions
- **3-Layer Ancient Immortal Tomb Excavation (`SECT.IMMORTAL_TOMB` / `EXPLORE.IMMORTAL_TOMB`):**
  - `discoverTombSite(W, templateId)` and `excavateTombLayer(W, siteId)` across Layer 1 (`ARRAY` + `FORGING`), Layer 2 (`SCRIPTURE` + `comprehension`), and Layer 3 (Guardian Automaton boss + Immortal Legacy unlock).
- **Pillar 5 (v4.0.0) — 4 Living Micro-Locations (`EXPLORE.MICRO_LOCATIONS` in `js/explore.js` & `MAP.MICRO_LOCATIONS` in `js/world_map.js`):**
  1. `LOC_NAMELESS_SWORD_TOMB` (`สุสานกระบี่นิรนาม`, Northern Peaks, `x:62, y:24`): `COMPREHEND_SWORD_INTENT` / `EXCAVATE_ANCIENT_BLADE` (`MAT_ORE_COLD_STEEL_2`, `MAT_ORE_STAR_COPPER_3`).
  2. `LOC_ANCIENT_MECH_RUINS` (`ซากนครกลไกบรรพกาล`, Western Badlands, `x:28, y:58`): `DISMANTLE_CORE_GEAR` / `DECIPHER_PUPPET_BLUEPRINT` (`MAT_ORE_STAR_COPPER_3`, `MAT_ORE_MAGNET_LODESTONE_3`).
  3. `LOC_MYRIAD_VENOM_FOREST` (`ป่าหมื่นพิษเร้นลับ`, Southern Waters, `x:44, y:82`): `HARVEST_VENOM_HERBS` / `SUBDUE_GU_INSECT` (`MAT_HERB_VENOM_VINE_3`, `MAT_HERB_ANCIENT_MIST_FERN_3`).
  4. `LOC_MOON_MIRROR_VALLEY` (`หุบเขากระจกจันทรา`, Eastern Plains, `x:82, y:46`): `MEDITATE_MOON_REFLECTION` (clears `heartDemon`) / `GATHER_LUNAR_DEW` (`MAT_HERB_JADE_LOTUS_2`, `MAT_HERB_MERIDIAN_FLOWER_3`).
  - Dispatched via `EXPLORE.dispatchExploration(W, locId, party, opts)` with automatic integration of regional `SECT.OUTPOSTS_LOGISTICS` camp perks.
