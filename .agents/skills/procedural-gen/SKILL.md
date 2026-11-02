---
name: procedural-gen
description: Master JianghuSect Evolution's deterministic PRNG (U.RNG), 240x192 World Map & Southern Spirit River generation (js/world_map.js), Wildlife & Wild Resource ecology (js/wildlife.js, js/wild_resources.js), River Fishing Monte Carlo loot tables (js/fishing.js), and Ancient Sanctum exploration (js/explore.js).
origin: jianghusect-custom
category: world-procgen-ecology
---

# JianghuSect Procedural Generation: Seeded World Map, Ecology, Fishing & Sanctums

## Purpose
Enforce deterministic procedural generation, spatial reachability, ecological conservation, and calibrated loot probability tables across **JianghuSect Evolution (JHEvo)** (`js/util.js`, `js/world_map.js`, `js/wildlife.js`, `js/wild_resources.js`, `js/fishing.js`, `js/explore.js`, `js/visitors_clues.js`).

Use this skill whenever:
- Modifying the **240×192 World Map**, sect buildings, stations, bridges, or terrain passability (`js/world_map.js`)
- Touching **Southern Spirit River Fishing**, mysterious containers, or unique legendary artifact drop pools (`js/fishing.js`)
- Adjusting **On-Map Wildlife & Wild Resource Nodes** (`js/wildlife.js`, `js/wild_resources.js`, `data/data_ecology.js`)
- Extending **Ancient Sanctums, Ruins, Clues, or Outside Expeditions** (`js/explore.js`, `js/expedition.js`, `js/visitors_clues.js`)

---

## 1. Strict Seeded Determinism (`U.RNG`)

1. **Zero `Math.random()` in Gameplay/World Logic**:
   - Always use the world's seeded PRNG instance `W.rng` (or a child `U.RNG(seed)` derived deterministically from `W.seed`, `W.day`, or node coordinates).
   - Core methods on `U.RNG`: `rng.next()` (`0..1`), `rng.int(min, max)`, `rng.chance(p)`, `rng.pick(array)`, `rng.weighted(array, weightFn)`.
2. **Reproducible Replay & Monte Carlo Audits**:
   - Given the same seed, world generation, sanctum exploration replays (`test/exploration_replay.js`), and 100,000-trial loot simulations must produce deterministic, reproducible distributions.

---

## 2. 240×192 World Map & Southern Spirit River (`js/world_map.js`)

1. **Map Geometry & Passability Invariants**:
   - Grid size is **`240 × 192`** tiles (`MAP.W = 240`, `MAP.H = 192`).
   - The **Southern Spirit River (แม่น้ำวิญญาณทิศใต้)** spans the southern region with impassable deep water tiles, crossed by **3 bridges** connecting the sect to the southern wilds.
   - All **26 fishing stations** (`kind: 'fish'`) along the riverbanks and docks must remain path-reachable (`MAP.findPath`) from the sect plaza!
2. **Buildings & Stations (`W.map.buildings`, `W.map.stations`, `W.map.byId`)**:
   - Every sect facility registers its interactive stations (`meditate`, `lift`, `dummy`, `spar`, `study`, `cauldron`, `anvil`, `array`, `farm`, `mine`, `cook`, `eat`, `bed`, `pray`, `worship`, `music`, `relax`, `fish`, etc.) with valid door coordinates (`b.door`) and interior flags (`s.inside`).

---

## 3. Southern Spirit River Fishing & Monte Carlo Loot (`js/fishing.js`)

1. **10-Species Fish Catalog & Bounded Zone Depletion**:
   - 10 distinct fish species (`FISH_*`) across tiers with bounded zone pools that deplete as NPCs fish (`AI.ACTS.riverFish`) and recover naturally each day.
2. **Exact Probability Tables**:
   - **Catch Roll**: `~90%` Fish (`89.94%`), `~10%` Mysterious Container (`10.05%`).
   - **Container Opening Roll**: `~50%` Trash (`49.89%`), `~49.65%` Ordinary Reward, `~0.45%` Unique Legendary Artifact (`0.446%`).
3. **Unique Legendary Non-Duplication (`W.world.claimedLegendaries` / `VC.syncUniqueArtifacts`)**:
   - All **33 unique legendary artifacts** can only be claimed **once per world**. Once claimed (in sect stock, NPC bag/equip, or history), they are excluded from future drops; if the legendary pool is exhausted, rolls fall back cleanly to high-tier ordinary rewards without crashing or duplicating.

---

## 4. Wildlife Ecology & Wild Resource Nodes (`js/wildlife.js`, `js/wild_resources.js`)

1. **Coherent Biome Regions**:
   - Herbs, ore veins, and spirit beasts spawn in biome-appropriate regions (`data/data_ecology.js`) matching their elemental and tier profiles.
2. **Claim & Reservation Hygiene**:
   - When an NPC targets a wild resource node (`WILD_RES`), the claim must be released (`WILD_RES.releaseClaim(W, npc)`) if the NPC is interrupted, cancels, or dies.
3. **Live Capture Conservation (`BEAST_SOVEREIGN` & Universal Taming)**:
   - Capturing a wild spirit beast alive removes the entity cleanly from `W.wildlife` and transfers it to `npc.pets` or `W.sect.menagerie` without duplicating loot or leaving ghost map markers.

---

## 5. Verification Checklist

Run these suites from `GAME_SOURCE/` after any map, ecology, fishing, or exploration change:
```bash
node test/fishing_river_suite.js
node test/wild_resources.js
node test/wildlife_batches.js
node test/wildlife_spawn_integrity.js
node test/onmap_wildlife.js
node test/beast_ecology.js
node test/ecology_expansion.js
node test/coherent_regions_recipes.js
node test/explore.js
node test/exploration_replay.js
node test/visitors_clues_weapons_suite.js
node test/legendary_spawn_gate.js
```
