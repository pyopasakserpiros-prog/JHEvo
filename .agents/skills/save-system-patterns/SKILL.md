---
name: save-system-patterns
description: Ensure 100% save/load round-trip integrity, legacy save migration (v1.9 through v2.0.17), receipt idempotency, and transient cache stripping in JianghuSect Evolution (js/sim.js).
origin: jianghusect-custom
category: save-load-persistence
---

# JianghuSect Evolution (v2.0.17) — Save/Load Serialization & Migration Blueprint (`js/sim.js`)

This skill governs `SIM.serialize(W)` and `SIM.deserialize(str)` in `GAME_SOURCE/js/sim.js` (lines 559–653), ensuring 100% round-trip state preservation, transient cache stripping, forward/backward save compatibility, and idempotent mid-action recovery.

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
return JSON.stringify(snap, (k, v) => (k[0] === '_' && k !== '_ver') ? undefined : v);
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
