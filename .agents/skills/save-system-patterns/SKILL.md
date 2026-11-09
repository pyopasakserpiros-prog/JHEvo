---
name: save-system-patterns
description: Use when changing JianghuSect save/load, serialized state, caches or migration behavior.
origin: jianghusect-custom
category: save-load-persistence
---

# JianghuSect Evolution — Save/Load Serialization & Migration Blueprint (`js/sim.js`)

> **Current baseline 4.1.0 (updated from 2.0.28–3.6.0):** This project-specific skill contains historical material from earlier versions. The targeted corrections below do not certify every older formula or API. Before implementing, verify the relevant behavior against current source and tests; use `project_status_and_ai_onboarding.md` for the current feature inventory and `AGENTS.md` for project rules.

This skill governs `SIM.serialize(W)` and `SIM.deserialize(str)` in `GAME_SOURCE/js/sim.js` (lines 559–653), covering transient cache stripping, current-schema save/load and mid-action recovery. Legacy compatibility is not required unless the user requests it; test the actual affected paths.

---

## 1. Serialization Contract (`SIM.serialize(W)` — `js/sim.js` lines 559–565)

### 1.1 Snapshot Schema (`snap`)
- **Version & Fingerprint:**
  - `schemaVersion: SIM.SAVE_SCHEMA_VERSION` (`'2.0.0-elemental'`)
  - `v: SIM.VERSION` (`'1.10.11'`)
  - `hc: HC.FINGERPRINT` (`'155:2f9c9dd7'` — verified on load; throws if mismatched)
- **Authoritative Top-Level Keys:**
  - `seed`, `t`, `speed`, `rng` (`W.rng.getState()` — 4-integer xorshift128+ tuple), `seqN`, `logSeq`, `deaths`, `avgSat`, `avgMood`, `weather`, `market`, `sect`, `world`, `threat`, `explore`, `npcs`, `graveyard`, `gone`, `logs` (`W.logs.slice(-600)`), `duelQueue`, `fights`, `foes`, `foeSeq`, `fightSeq`, `runtimeTiming`, `wildlife`, `wildResources`, `fishing`, and `map: { extra: M.extraSt || [], buildings: ... }`.
- **Forward-Compatible Unknown Keys (`W._saveExtras`):**
  - Spreads `...(W._saveExtras || {})` into `snap` so unknown top-level keys from newer/custom patches survive save/load untouched.

### 1.2 Transient Cache Stripping Replacer (`js/sim.js` line 564)
```javascript
return JSON.stringify(snap, (k, v) => ((k[0] === '_' && k !== '_ver') || k === 'jianghuSects' || k === 'inventoryIntelligence') ? undefined : v);
```
- **Crucial Invariant:** Every property key starting with `_` (except `_ver`) is **automatically stripped** during `SIM.serialize(W)`!
  - **Allowed (Transient Caches):** `_st`, `_stVer`, `_stTick`, `_pass`, `_passVer`, `_eqSetCache`, `_elemPowerCache`, `_cultRateBase`, `_stockDirty`, `_hasCatalysts`, `_pcTick`, `_pcVal`, `_alivePopCount`, `_cogModCtx`.
  - **Forbidden:** Never store persistent gameplay state in a property starting with `_` (e.g., do NOT use `W.sect._gateBeasts` for persistent data; use `W.sect.gateBeasts` without a leading underscore!).

---

## 2. Deserialization & Migration Pipeline (`SIM.deserialize(str)` — `js/sim.js` lines 566–653)

### 2.1 Strict Input Validation (lines 567–585)
- Validates JSON root object, `s.hc === HC.FINGERPRINT`, `s.seed`, `Number.isSafeInteger(s.t)`, `seqN`, `logSeq`, `s.rng` (array of 4 integers), required objects (`sect`, `world`, `market`, `weather`, `threat`, `map`), required arrays (`npcs`, `logs`, `graveyard`, `gone`, `map.buildings`, `map.extra`), and unique `npc.id` strings.
- Wraps world reconstruction in `try / catch` and restores `HC.nowDay` and `STATS.now` if deserialization throws (preventing global state pollution on bad save input).

### 2.2 World Reconstruction & Pointer Rebinding (lines 589–613)
1. Calls `const W = SIM.create(s.seed, { masterIdx: 0 })` to build deterministic terrain (`W.map`) and base structures.
2. Restores PRNG state `W.rng.setState(s.rng)` and clock `W.t = s.t`, `W.day = Math.floor(W.t / 1440)`, `W.season = SIM.calendar(W.t).season`, `HC.nowDay = W.day`, `STATS.now = W.t`.
3. Rebuilds lookup maps:
   - `W.foeById = {}; W.foes.forEach(u => W.foeById[u.id] = u);`
   - `W.wildlife.beasts = W.wildlife.beasts.map(b => W.foeById[b.id] || b);` (re-links wildlife beast references to live `W.foes` objects).
   - `W.byId = {}; W.npcs.forEach(n => { W.byId[n.id] = n; MARTIAL.ensureSkills(n); });`
4. Restores building levels/HP, reconstructs `s.map.extra` stations, clears and re-binds station `.occ`, `.owner` (`n.bed`), and `b.inside` arrays from live `W.npcs`.
5. Captures any unknown top-level keys into `W._saveExtras` (`knownKeys` set at line 611).

### 2.3 Legacy Save Hydration & Post-Load Sanitizers (lines 614–647)
Always run idempotent `ensure*` hooks at the end of `SIM.deserialize`:
- `SECT.ensureDirectives(W)` & `SECT.ensureFacilityDemand(W)`
- `ECO.ensureStockTracker(W)` & `CPE.S(W)`
- `CONTENT.ensure(W)` (hydrates missing `W.sect.catalysts`, `W.sect.gateBeasts`, `W.sect.supportDoctrine`, `W.world.sanctums`, `W.world.sects`, etc.)
- `MARTIAL.restore(W)` & `FISHING.ensure(W)`
- **Idempotent Craft Receipt Adoption & Pruning (lines 620–626):**
  - Adopts legacy mid-craft actions via `ECO.adoptLegacyCraft(W, n, r, ctx)` and prunes orphaned receipts via `ECO.pruneCraftTransactions(W)`.
- **Dead-Reference Pruning (lines 627–642):**
  - Prunes `W.sect.delegations`, `W.sect.petitions`, and `n.cognition.commitment` if the referenced NPC is missing or `.dead`.
- **Elemental & Human Core Hydration (lines 643–645):**
  - Runs `SECT.sanitizeQueue(W)` and calls `ELEM.ensureNpcElementalState(n)` + `HC.touch(n)` on all active and queued NPCs.
- **Gear UID Deduplication & Durability Integrity (line 646):**
  - `ECO.ensureUniqueGearUids(W)` clones shared object references, assigns unique UIDs, strips sold gear found in `W.sect.soldGearReceipts`, and backfills `dur`/`maxDur`/`repairCount`.

---

## 3. Checklist When Adding New State (v2.0.17)
1. **No Leading Underscore:** Name persistent properties without `_` (e.g., `W.sect.gateBeasts`, `W.sect.celestialTribulation`, `W.world.jianghu`, `W.world.nineDaoPagoda`).
2. **Hydrate in `SIM.deserialize` or an idempotent `ensure*` hook:** Ensure old saves initialize new state safely. `SECT.CELESTIAL_TRIBULATION.ensure(W)`, `SECT.MENTORSHIP.ensure(W)`, and `SECT.JIANGHU.ensure(W)` initialize gracefully if missing.
3. **Ascension & Mentorship state:** Persist IDs and timestamps for `W.sect.celestialTribulation`, `SECT.MENTORSHIP` records, and `W.world.jianghu.karmaBonds`. Never serialize raw DOM elements, functions, or cyclic object references.
4. **Run Save/Load Regression Tests:**
   ```bash
   cd GAME_SOURCE
   node test/legacy_save.js
   node test/save_integrity.js
   ```

## Patch v2.0.18 Policy Update: No Legacy Save Backwards-Compatibility Required
- **"ไม่จำเป็นต้องทำให้เซฟเก่าเล่นต่อได้"**: AI is unlocked to design new architectures and data structures freely without worrying about backwards compatibility with saves from previous versions. Within-version `SIM.serialize` / `SIM.deserialize` determinism remains verified.


## v3.1.0 Save Schema (`3.1.0-autonomous-governance-peaks`)
- `SIM.PATCH_VERSION = '2.1.0'`, `SIM.SAVE_SCHEMA_VERSION = '3.1.0-autonomous-governance-peaks'`.
- `SIM.serialize` and `SIM.deserialize` preserve `W.sect.unlockSpecializedOffices`, `W.sect.dungeon`, `W.sect.jurisdictionLog`, `W.sect.vanguardPosture`, `W.sect.vanguardInterceptBonus`, `W.sect.diplomacyBonus`, and `W.sect.dungeonSecurity` with 100% post-load determinism.

---

## Patch v3.6.0 – v4.0.0 Save Schema & Resilient Whitelist (`4.0.0-living-frontier-charter`)
- `SIM.PATCH_VERSION = '2.1.0'`, `SIM.SAVE_SCHEMA_VERSION = '4.0.0-living-frontier-charter'`.
- `SIM.TRANSIENT_CACHE_KEYS` explicitly whitelists transient caches (`_c`, `_d`, `_cs`, `_csBase`, `_csStatic`, `_cultRateBase`, `_nd`, `_hpMaxCache`, `_qiMaxCache`, `_mDer`, `_condCache`, `_wsBase`, `_skRateCache`, `_dwVer`, `_dwDay`, `_alivePop`, `jianghuSects`, `inventoryIntelligence`) while preserving `_btBonusPct`, `_dantianBonusPct`, `W.sect.outposts`, `W.sect.charter`, `W.sect.strategicCouncil`, `W.sect.microLocations`, and `npc.combatHistory` across `SIM.serialize` / `SIM.deserialize`.

## Patch v4.1.0 Save Schema (`4.1.0-sect-expansion-peaks-sanctuary`)
- `SIM.PATCH_VERSION = '2.1.0'`, `SIM.SAVE_SCHEMA_VERSION = '4.1.0-sect-expansion-peaks-sanctuary'`.
- `SIM.deserialize` calls `SECT.PEAKS.ensure(W)`, `SECT.ELEMENTAL_BARRIER.ensure(W)`, and `MAP.syncPeakSanctuaries(W)` so all 8 Peak Sanctuary building levels, `founded` states, active stations, and barrier element settings (`W.sect.barrierElement`, `W.sect.barrierActive`) are 100% preserved across save/load.


## JianghuSect 2 v2.0.0 Note (The 27 Grand Dao Epoch)
- **Patch / Schema**: `SIM.PATCH_VERSION = '2.1.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.1.0-grand-dao-debates-apex-trials'`
- **Scale**: 27 Major Cultivation Paths (`3^3`), 222 Subpaths, `CULT.MORTAL_INITIATION`, `SECT.PATH_LIBRARY` (1 starter path + 27 Manuals + 27 Crystals), 6 new weapon classes (`ROSARY`, `CLAW`, `NEEDLE`, `FAN`, `ASTROLABE`, `ABACUS`), 15 new Composable Triggers & Actions, 137/137 test suites passing.


## หมายเหตุเฉพาะการแก้บั๊ก JS2-v2.4.0

receipt ประตูธาตุ, ของขวัญคนพเนจร และวันประลองใช้ field ปกติที่ไม่ขึ้นต้นขีดล่าง; เซฟ whitelist ท่วงท่า สแต็กต้าน ดาเมจสะสม และ cooldown โอนสถานะ/ขโมยจังหวะ; มี regression โหลดซ้ำสำหรับประตูและวันประลอง แต่ transient state อื่นยังต้องตรวจ ดู [`docs/audits/JS2_V2_4_0_FIX_TRACKER_TH.md`](../../../docs/audits/JS2_V2_4_0_FIX_TRACKER_TH.md) สำหรับสถานะและข้อจำกัดที่ยังเหลือ


## Patch JS2-v2.6.0 Save Schema (`2.6.0-living-chronicle-and-reporting`)
- `SIM.PATCH_VERSION = '2.6.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.6.0-living-chronicle-and-reporting'`.
- `SIM.SUPPORTED_SAVE_SCHEMAS` includes `'2.4.0-tactical-composable-grand-dao'`, `'2.5.0-pathbound-visuals-and-item-art'`, and `'2.6.0-living-chronicle-and-reporting'`.
- `SIM.create` and `SIM.deserialize` call `EXPED.ensureNewsSystem(W)` to initialize/hydrate `W.sect.newsPrefs` (preset, criticalBypassMode, digestIntervalDays, categories, trackedNpcIds, trackedSectIds, readLogWatermarkId, readChronicleWatermarkSeq, readEntryKeys), `W.sect.digestHistory`, `W.sect.sectChronicleTrimmedCount`, and `W.world.chronicleTrimmedCount`.

## JS2-v2.5.0 Combat VFX snapshot fields (carried on v2.6.0 main)
- Existing latest-cast snapshot `npc.castFx` may serialize with its actor record; visual fields include `weaponType`, `tier`, `arch`, `originX`, `originY`, and bounded `targetPoints`. This does not add a save subsystem or schema.
- Renderer queue/clock/dedup (`Render.castActive`, `castClock`, `castSeen`) stays local and resets/baselines in `Render.setWorld`, preventing loaded cast replay. Persistent buff auras read existing status entries and don't add or modify save data.
- `test/weapon_motion_vfx_suite.js` verifies rendering leaves `SIM.serialize(W)` and RNG unchanged; browser tests verify marker/aura Canvas output.
