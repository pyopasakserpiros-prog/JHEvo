---
name: save-system-patterns
description: Ensure 100% save/load round-trip integrity, legacy save migration (v1.9 through v2.0.9+), receipt idempotency, and transient cache stripping in JianghuSect Evolution (js/sim.js).
origin: jianghusect-custom
category: save-serialization-migration
---

# JianghuSect Save System: Serialization, Legacy Migration & Round-Trip Integrity

## Purpose
Maintain rock-solid persistence, legacy save upgrades, and deterministic round-trip serialization (`SIM.save` / `SIM.load`) in **JianghuSect Evolution (JHEvo)** (`js/sim.js`, `test/save_integrity.js`, `test/legacy_save.js`).

Use this skill whenever:
- Adding new state properties to `W`, `W.sect`, `W.world`, or `npc`
- Modifying `SIM.save(W)` or `SIM.load(jsonOrObj)` in `GAME_SOURCE/js/sim.js`
- Adding new sect facilities, cultivation path states (`mechState`, `karmaState`, `pets`, `menagerie`, `supportDoctrine`), or elemental state (`npc.ext.elementalSystem`)

---

## 1. Save Architecture & Core Invariants (`GAME_SOURCE/js/sim.js`)

1. **Human Core Fingerprint Verification**:
   - Every save payload records `hcFingerprint: HC.FINGERPRINT` (`'155:2f9c9dd7'`).
   - On `SIM.load`, `HC.validate(npc)` verifies that every loaded NPC's `npc.h` 12-layer structure is intact and free of `NaN` or missing layers.
2. **Strip Transient Runtime Caches Before Saving**:
   - NPCs carry derived runtime caches for performance: `npc._c`, `npc._d`, `npc._cs`, `npc._csBase`, `npc._nd`, `npc._dw`, and transient DOM/path references.
   - Never rely on underscore-prefixed cache properties persisting across save/load; `SIM.load` must reconstruct `W.byId`, station occupancy (`W.map.stations[id].occ`), building `inside` arrays, and call `HC.touch(npc)` so caches rebuild cleanly on the first tick.
3. **Save/Load Round-Trip Idempotency**:
   - Calling `const s1 = SIM.save(W); const W2 = SIM.load(s1); const s2 = SIM.save(W2);` must preserve all gameplay state:
     - All 9 cultivation paths, subpaths, stages, `track` ordinals, learned `techs`, and `mantra`
     - Active timed `npc.buffs` (including exact `until` timestamps)
     - Spirit beast companions (`npc.pet`, `npc.pets`) and reserve `W.sect.menagerie`
     - Specialist facilities (`W.sect.specialistFacilities`: `mech_workshop`, `beast_menagerie`, `harmonic_pavilion`) and `W.sect.supportDoctrine`
     - Unique legendary artifact registry (`W.world.claimedLegendaries`)
     - NPC `cognition` (`aspiration`, `goal`, `suspendedGoal`, `commitment`, `officeDecision`)

---

## 2. Legacy Save Migration Rules (`SIM.load`)

When loading an older save (e.g., `test/fixtures/v1_9_synthetic.json` or v2.0.0–v2.0.8 saves):
1. **Non-Destructive Default Hydration**:
   - Always initialize new sect structures if missing:
     - `SECT.ensureSpecialistFacilities(W)`
     - `SECT.ensureSupportDoctrine(W)`
     - `W.sect.menagerie = W.sect.menagerie || []`
     - `W.sect.legacyTablets = W.sect.legacyTablets || []`
   - Always initialize new NPC structures if missing:
     - `ELEM.ensureNpcElementalState(npc)`
     - Path-specific state (`npc.mechState`, `npc.karmaState`, `npc.pets`)
     - `COG.prepare(W, npc)`
2. **Migration Receipt Idempotency**:
   - Any one-time migration grant (such as starter recipes, map expansion from smaller grids to `240×192` with the Southern Spirit River, or retrofitted subpath tracks) must record a migration receipt flag on `W.world` so loading and re-saving never duplicates items, stations, or progression!

---

## 3. Verification Checklist

Always run these suites from `GAME_SOURCE/` after touching any state schema or `js/sim.js`:
```bash
node test/save_integrity.js
node test/legacy_save.js
node test/core_lock.js
node test/fishing_river_suite.js
node test/v208_paths_and_beast_pets_suite.js
node test/v209_facilities_party_synergy_suite.js
```
