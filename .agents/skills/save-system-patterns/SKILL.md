---
name: save-system-patterns
description: Ensure 100% save/load round-trip integrity, legacy save migration (v1.9 through v2.0.9+), receipt idempotency, and transient cache stripping in JianghuSect Evolution (js/sim.js).
---

# JianghuSect Evolution — Save/Load Serialization & Migration Blueprint (`js/sim.js`)

This skill governs `SIM.serialize(W)` and `SIM.deserialize(str)` in `GAME_SOURCE/js/sim.js` (lines 533–620), ensuring 100% round-trip state preservation, transient cache stripping, forward/backward save compatibility, and idempotent mid-action recovery.

---

## 1. Serialization Contract (`SIM.serialize(W)` — `js/sim.js` lines 534–540)

### 1.1 Snapshot Schema (`snap`)
- **Version & Fingerprint:**
  - `schemaVersion: SIM.SAVE_SCHEMA_VERSION` (`'2.0.0-elemental'`)
  - `v: SIM.VERSION` (`'1.10.11'`)
  - `hc: HC.FINGERPRINT` (`'155:2f9c9dd7'` — verified on load; throws if mismatched)
- **Authoritative Top-Level Keys:**
  - `seed`, `t`, `speed`, `rng` (`W.rng.getState()` — 4-integer xorshift128+ tuple), `seqN`, `logSeq`, `deaths`, `avgSat`, `avgMood`, `weather`, `market`, `sect`, `world`, `threat`, `explore`, `npcs`, `graveyard`, `gone`, `logs` (`W.logs.slice(-600)`), `duelQueue`, `fights`, `foes`, `foeSeq`, `fightSeq`, `runtimeTiming`, `wildlife`, `wildResources`, `fishing`, and `map: { extra: M.extraSt || [], buildings: ... }`.
- **Forward-Compatible Unknown Keys (`W._saveExtras`):**
  - Spreads `...(W._saveExtras || {})` into `snap` so unknown top-level keys from newer/custom patches survive save/load untouched.

### 1.2 Transient Cache Stripping Replacer (`js/sim.js` line 539)
```javascript
return JSON.stringify(snap, (k, v) => (k[0] === '_' && k !== '_ver') ? undefined : v);
```
- **Crucial Rule:** Every property key starting with `_` (except `_ver`) is **automatically stripped** during `SIM.serialize(W)`!
  - **Good (Transient Caches):** `_st`, `_stVer`, `_stTick`, `_pass`, `_passVer`, `_eqSetCache`, `_elemPowerCache`, `_cultRateBase`, `_stockDirty`, `_hasCatalysts`, `_pcTick`, `_pcVal`.
  - **Forbidden:** Never store persistent gameplay state in a property starting with `_` (e.g., do NOT use `W.sect._gateBeasts` for persistent data; use `W.sect.gateBeasts` without a leading underscore!).

---

## 2. Deserialization & Migration Pipeline (`SIM.deserialize(str)` — `js/sim.js` lines 541–620)

### 2.1 Strict Input Validation (lines 542–560)
- Validates JSON root object, `s.hc === HC.FINGERPRINT`, `s.seed`, `Number.isSafeInteger(s.t)`, `seqN`, `logSeq`, `s.rng` (array of 4 integers), required objects (`sect`, `world`, `market`, `weather`, `threat`, `map`), required arrays (`npcs`, `logs`, `graveyard`, `gone`, `map.buildings`, `map.extra`), and unique `npc.id` strings.
- Wraps world reconstruction in `try / catch` and restores `HC.nowDay` and `STATS.now` if deserialization throws (preventing global state pollution on bad save input).

### 2.2 World Reconstruction & Pointer Rebinding (lines 564–581)
1. Calls `const W = SIM.create(s.seed, { masterIdx: 0 })` to build deterministic terrain (`W.map`) and base structures.
2. Restores PRNG state `W.rng.setState(s.rng)` and clock `W.t = s.t`, `W.day = Math.floor(W.t / 1440)`, `HC.nowDay = W.day`, `STATS.now = W.t`.
3. Rebuilds lookup maps:
   - `W.foeById = {}; W.foes.forEach(u => W.foeById[u.id] = u);`
   - `W.wildlife.beasts = W.wildlife.beasts.map(b => W.foeById[b.id] || b);` (re-links wildlife beast references to live `W.foes` objects).
   - `W.byId = {}; W.npcs.forEach(n => { W.byId[n.id] = n; MARTIAL.ensureSkills(n); });`
4. Restores building levels/HP, reconstructs `s.map.extra` stations, clears and re-binds station `.occ`, `.owner` (`n.bed`), and `b.inside` arrays from live `W.npcs`.
5. Captures any unknown top-level keys into `W._saveExtras` (`knownKeys` set at line 579).

### 2.3 Legacy Save Hydration & Post-Load Sanitizers (lines 582–614)
Always run idempotent `ensure*` hooks at the end of `SIM.deserialize`:
- `SECT.ensureDirectives(W)` & `SECT.ensureFacilityDemand(W)`
- `ECO.ensureStockTracker(W)` & `CPE.S(W)`
- `CONTENT.ensure(W)` (hydrates missing `W.sect.catalysts`, `W.sect.menagerie`, `W.sect.supportDoctrine`, `W.sect.specialistFacilities`, `W.world.sanctums`, `W.world.sects`, etc.)
- `MARTIAL.restore(W)` & `FISHING.ensure(W)`
- **Idempotent Craft Receipt Adoption (lines 588–594):**
  - Adopts legacy mid-craft actions via `ECO.adoptLegacyCraft(W, n, r, ctx)` and prunes orphaned receipts via `ECO.pruneCraftTransactions(W)`.
- **Dead-Reference Pruning (lines 595–610):**
  - Prunes `W.sect.delegations`, `W.sect.petitions`, and `n.cognition.commitment` if the referenced NPC is missing or `.dead`.
- **Elemental & Human Core Hydration (lines 611–613):**
  - Runs `SECT.sanitizeQueue(W)` and calls `ELEM.ensureNpcElementalState(n)` + `HC.touch(n)` on all active and queued NPCs.

---

## 3. Checklist When Adding New State (including v2.0.11)
1. **No Leading Underscore:** Name persistent properties without `_` (e.g., `W.sect.gateBeasts`, `W.sect.sectArchetype`, `W.world.pagoda`, `W.world.elementalRealms`, `W.world.martialConference`).
2. **Hydrate in `SIM.deserialize` or an idempotent `ensure*` hook:** Ensure old saves initialize new state safely. v2.0.11 calls `SECT.ensureCelestialTribulation(W)` during deserialization.
3. **Ascension event state:** Persist IDs and dates for `W.sect.celestialTribulation`; persist `npc.ancestralPrayerCooldownUntil`; keep aggregate ascension count/history outside the 36-tablet cap. Never serialize object references or underscore-prefixed gameplay state.
4. **Run Save/Load Regression Tests:**
   ```bash
   node GAME_SOURCE/test/test_save_migration.js
   node GAME_SOURCE/test/test_v209_integrated.js
   ```
