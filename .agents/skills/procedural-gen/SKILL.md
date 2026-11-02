---
name: procedural-gen
description: Master JianghuSect Evolution's deterministic PRNG (U.RNG), 240x192 World Map & Southern Spirit River generation (js/world_map.js), Ancient Sanctums, Nine-Dao Pagoda & Five-Elemental Realms (js/explore.js), Expeditions, Caravans & Sect Raids (js/expedition.js), River Fishing Monte Carlo loot tables (js/fishing.js), and Wildlife/Resource ecology (js/wildlife.js, js/wild_resources.js).
origin: jianghusect-custom
category: world-procgen-exploration
---

# JianghuSect World, Exploration, Sanctums, Expeditions & Procedural Generation

## Purpose
Provide the deep-dive, source-verified engineering specification for **JianghuSect Evolution (JHEvo)** world generation, dungeons/trials, outside expeditions, sect raids, river fishing, and ecology (`GAME_SOURCE/js/explore.js`, `GAME_SOURCE/js/expedition.js`, `GAME_SOURCE/js/world_map.js`, `GAME_SOURCE/js/fishing.js`, `GAME_SOURCE/js/wildlife.js`, `GAME_SOURCE/js/wild_resources.js`, `GAME_SOURCE/js/visitors_clues.js`).

Use this skill whenever:
- Adding or modifying **Ancient Sanctums (`EX.SANCTUMS`, `EX.resolveSanctum`)**, **The Nine-Dao Trial Pagoda (`EX.NINE_DAO_PAGODA`)**, **Five-Elemental Secret Realms (`EX.ELEMENTAL_REALMS`)**, the 10-floor **Misty Cave (`EX.CAVE_FLOORS`)**, or the 12 **Dimensional Gate Worlds (`EX.WORLDS`)** in `js/explore.js`
- Modifying **Outside Expeditions (`EXPED.volunteer`, `EXPED.depart`, `EXPED.createParty`)**, **Spirit Mount Caravans**, or **Sect Raid Spawning & Defense (`EXPED.spawnRaid`, `EXPED.rally`, `EXPED.raidEnd`, `W.sect.gateBeasts`)** in `js/expedition.js`
- Touching the **240×192 World Map**, **Southern Spirit River**, **Fishing Monte Carlo Loot Tables**, **33 Unique Legendary Artifacts**, or **On-Map Wildlife/Resource Nodes**

---

## 1. Deterministic PRNG Contract (`U.RNG` in `js/util.js`)

1. **Zero `Math.random()` in Gameplay/World Code**:
   - Every random roll in `explore.js`, `expedition.js`, `fishing.js`, `wildlife.js`, and `world_map.js` MUST use `W.rng` (or a deterministic child `U.RNG(seed)`).
   - Core API:
     - `rng.next()` → float in `[0, 1)`
     - `rng.int(min, max)` → integer in `[min, max]` inclusive
     - `rng.chance(prob)` → boolean (`rng.next() < prob`)
     - `rng.pick(array)` → uniform element selection
     - `rng.weighted(array, weightFn)` → weighted random selection
     - `rng.shuffle(array)` → in-place deterministic Fisher–Yates shuffle
     - `rng.gauss(mean, sd)` → Gaussian normal distribution sample
2. **Replayability & Auditability**:
   - Exploration runs record structured floor/encounter logs (`ex.journal`, `out.floorLogs`, `W.sect.sanctums.history`) verified by `test/exploration_replay.js`.

---

## 2. Exploration, Sanctums, Pagoda & Secret Realms (`GAME_SOURCE/js/explore.js` — `EX` / `EXPLORE`)

### 2.1 Sect Exploration Spots (`EX.SPOTS`) & 10-Floor Cave (`EX.CAVE_FLOORS`)
- **6 Sect Spots**: `stele` (แท่นศิลาจารึก), `spring` (น้ำพุปราณลับ), `ruin` (ซากเจดีย์ร้าง), `grove` (ป่าสมุนไพรเร้นลับ), `cave` (ถ้ำหมื่นสายหมอก 10 ชั้น), `gate` (ลานประตูมิติสู่แดนหมื่นพิภพ 12 โลก `EX.WORLDS`).
- **Cave Sampling (`EX.sampleCaveFloor(floor, rng)`)**:
  - Floors `1..10` each define 3 thematic sub-pools (`config.pools`).
  - Samples `1` or `2` pools without replacement (`1 + (rng.chance(0.55) ? 1 : 0)`), then picks 1 weighted encounter per pool. Never leaks unvisited pools into discovery logs!
- **Static Foe Reference Power (`EX.RANK_FOE_POWER`)**:
  - `{ 1: 95, 2: 480, 3: 2800, 4: 18500 }` — static world calibration (never rubber-banded to player gear).

### 2.2 Multi-Floor Sanctum / Pagoda Resolution Architecture (`EX.resolveSanctum`)
Follow the exact resolution pipeline in `EX.resolveSanctum(W, ex, members, opts)` when extending sanctums or building **`EX.NINE_DAO_PAGODA`** and **`EX.ELEMENTAL_REALMS`**:

1. **Party Formation Synergy Evaluation**:
   ```javascript
   const alive = members.filter(m => m && !m.dead);
   const formSyn = g.COMBAT.evaluateFormationSynergy(alive);
   // formSyn: { synergies, powerMultiplier, damageMitigation, reflectPct, auraNamesTh }
   ```
2. **Between-Floor Support Triage (`fl.floor > 1`)**:
   - If any living party member is on `SAGE_SUPPORT` path, automatically trigger free party triage between floors via:
     ```javascript
     g.CULT.castHealOrBuff(W, supportMember, m, { free: true, healPct: 0.35, buffKey: 'vitalRegen', duration: 300 });
     ```
3. **Floor Guardian & Tactical/Resonance Power Calculation**:
   - Evaluate lead weapon tactics: `const tac = g.COMBAT.resolveWeaponTactics(lead, guardian, { dist: 2.2 });`
   - Sum party power with 3-piece Equipment Resonance Set bonuses (`MARTIAL.evaluateResonanceSet(m)`) and multiply by `(tac.dmgMult || 1) * (formSyn.powerMultiplier || 1)`.
   - For **Nine-Dao Trial Pagoda (`EX.NINE_DAO_PAGODA`)**:
     - 9 Floors corresponding to all **9 Major Paths** (`XIAN`, `BODY`, `GOD`, `DEMON`, `HEART_SOUL`, `MECH_PUPPET`, `KARMA_SAMSARA`, `BEAST_SOVEREIGN`, `SAGE_SUPPORT`).
     - Any party can clear any floor via `CULT.equivalentStage(m)` and `formSyn.powerMultiplier`; disciples matching the floor's Dao Path receive Dao Resonance Insights (`CULT.gainWisdom`, comprehension/mastery) and 3-piece Resonance Set drops.
   - For **Five-Elemental Secret Realms (`EX.ELEMENTAL_REALMS`)**:
     - 5 rotating realms (`EARTH_METAL`, `WOOD_LIFE`, `WATER_ICE`, `FIRE`, `LIGHTNING`/`WIND` or 5 Wu-Xing elements) granting environmental bonuses to matching spiritual roots (`ELEM`) and dropping refinement catalysts (`ECO.REFINEMENT_CATALYSTS[catalystId]` via `ECO.addCatalyst(W, catalystId, 1)`).
4. **Handover & Return**:
   - Hand over all collected `out.stones`, `out.mats`, `out.pills`, `out.gear`, `out.techs`, and `out.catalysts` to the sect via `X.handover(W, ex, alive, out)`.
   - Reset each returning member (`m.away = false`, `m.hidden = false`, `m.travel = null`, `m.expId = null`) and record the run in `W.sect.sanctums.history` (capped at 20 entries).

---

## 3. Outside Expeditions, Spirit Mount Caravans & Sect Raids (`GAME_SOURCE/js/expedition.js` — `EXPED` / `X`)

### 3.1 Outside Missions & Fortune Registry (`X.REGIONS`, `X.MISSIONS`, `X.FORTUNE_REGISTRY`)
- **6 Regions (`X.REGIONS`)**: `forest`, `plains`, `mountain`, `desert`, `water` (aquatic beast pool), `ruins`.
- **7 Mission Types (`X.MISSIONS`)**: `fortune` (uses `X.FORTUNE_REGISTRY[1..4]`), `hunt`, `gather`, `trade`, `diplomacy`, `recruit`, `bounty`.
- **Office Approval**: The `mission` Elder (`SECT.holder(W, 'mission')`), Sect Master, or Deputy evaluates mission proposals via `COG.missionBias` and records `COG.officeDecision`.

### 3.2 Spirit Mount Caravan System (`X.depart` / `X.createParty`)
When assembling an expedition or trade caravan party:
- Check if any party member owns a Spirit Beast (`m.pets` or `m.pet`) with `role === 'MOUNT_CHARGER'` or `family === 'AVIAN'` or `family === 'UNGULATE'`.
- **Mount Modifiers**:
  - Reduce expedition travel duration by **25%** (`Math.max(1, Math.round(baseDur * 0.75))`).
  - Increase caravan/expedition loot & cargo capacity by **40%** (`×1.40`).

### 3.3 Sect Raid Spawning, Rally & Gate War-Beasts (`X.spawnRaid`, `X.rally`, `X.raidEnd`)
1. **Spawning Raiders (`X.spawnRaid(W, kind, strength)`)**:
   - `kind`: `'beast'` (land-capable species from `JD.BEASTS.species`), `'rival'` (most hostile sect in `W.world.sects`), or `'bandit'`.
   - Creates fight `const f = COMBAT.startFight(W, [], [], 'raid', { serious: true, cb: X.raidEnd, ctx: { label, kind, total } });`.
   - Spawns foe units at `MAP.EXIT` (`W.foes`, `W.foeById[id]`, `f.B.push(id)`).
2. **Rallying Defenders & Gate War-Beasts (`X.rally(W, f)`)**:
   - Living disciples evaluate `will` (from `courage`, `AI.dutyWeight`, `sectDuty`, rank, HP ratio, and Commander `social.leadership`) and join `f.A` via `COMBAT.join(W, f, n.id, 'A')`.
   - **Gate Vanguard War-Beasts (`W.sect.gateBeasts`)**: Reserve beasts assigned from `W.sect.beasts` to `W.sect.gateBeasts` enter raid defense alongside guards, absorbing enemy assault charges and triggering their bloodline traits (`ALPHA_FANG`, `IRON_CARAPACE`, `VENOM_GLAND`, `SOVEREIGN_AWAKENED`).

---

## 4. 240×192 World Map, Southern Spirit River & Fishing (`js/world_map.js`, `js/fishing.js`)

1. **Map Invariants (`MAP.W = 240`, `MAP.H = 192`)**:
   - Impassable Southern Spirit River water tiles crossed by **3 bridges**, with **26 path-reachable fishing stations** (`kind: 'fish'`).
2. **Fishing Monte Carlo & Unique Legendaries (`js/fishing.js`)**:
   - 10 fish species (`FISH_*`) with daily zone recovery.
   - Catch distribution: `~90%` Fish, `~10%` Mysterious Container (`~50%` Trash, `~49.55%` Ordinary, `~0.45%` Unique Legendary).
   - **33 Unique Legendaries (`W.world.claimedLegendaries`)**: Strictly non-duplicating across the entire world lifecycle, with clean ordinary fallback when all 33 are claimed.

---

## 5. Verification Checklist

Run these suites from `GAME_SOURCE/` after any exploration, sanctum, pagoda, expedition, raid, or map change:
```bash
node tools/validate_data_schema.js
node test/explore.js
node test/exploration_replay.js
node test/cave_pools.js
node test/diplomacy_sanctum_ancestral_suite.js
node test/fishing_river_suite.js
node test/wild_resources.js
node test/wildlife_batches.js
node test/wildlife_spawn_integrity.js
node test/onmap_wildlife.js
node test/beast_ecology.js
node test/legendary_spawn_gate.js
node test/v209_facilities_party_synergy_suite.js
```
