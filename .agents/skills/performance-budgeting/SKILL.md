---
name: performance-budgeting
description: Maintain JianghuSect Evolution's strict simulation performance budget (< 3.0 ms/tick for 80 NPCs, supporting 80x+ speed) through versioned caching (_ver, _passVer, earliestExpiry), allocation discipline, and tick throttling.
---

# JianghuSect Evolution — Simulation Performance Budgeting Blueprint (`< 3.0 ms/tick` at 80 NPCs)

This skill enforces the strict simulation CPU budget of **JianghuSect Evolution (สำนักยุทธ์เจียงหู)**: **`< 3.0 ms/tick` average across 80+ active NPCs**, enabling smooth **48×–80×+** fast-forward speeds on both mobile (Termux/Android) and desktop browsers.

---

## 1. Frame & Tick Budget Architecture (`js/main.js` & `js/sim.js`)

- **Frame Simulation Budget (`js/main.js` lines 6, 47–57):**
  - `TICKS_PER_SEC = 4`, `SIM_BUDGET_MS = 12` ms per `requestAnimationFrame`.
  - Pending ticks accumulate in `G.acc += dt * G.speed * TICKS_PER_SEC`.
  - The `while (G.acc >= 1)` loop breaks immediately if `performance.now() - t0 >= SIM_BUDGET_MS` so touch/pan gestures never freeze on mobile.
- **Per-Tick Target:**
  - At `80 NPCs`, each `SIM.tick(W)` must complete in **`< 3.0 ms`** (validated by `test/test_perf_80x_benchmark.js` and `tools/benchmark_80x.js`).

---

## 2. Versioned Caching Patterns (Zero-Redundant Recomputation)

Never recompute composite stats, passive effects, equipment resonance sets, or elemental power on every tick or combat strike. Always guard with version counters:

### 2.1 `STATS.compute(npc)` Version & Buff-Expiry Cache (`js/stats.js` lines 96–106)
```javascript
const ver = (npc._ver || 0) * 31 + (npc.cult ? npc.cult.stage * 7 + npc.cult.techs.length : 0)
  + (npc.equip && npc.equip.WEAPON ? 3 : 0) + (npc.equip && npc.equip.ARMOR ? 5 : 0)
  + (npc.equip && npc.equip.ACCESSORY ? 11 : 0) + (npc.inj ? npc.inj.length * 13 : 0)
  + (npc.buffs ? npc.buffs.length * 17 : 0);
const nowT = STATS.now || 0;
const earliestExp = npc._stEarliestBuffExp || 0;
const buffExpired = earliestExp > 0 && nowT >= earliestExp;
if (npc._st && npc._stVer === ver && !buffExpired && (nowT === 0 || npc._stTick === undefined || (nowT - npc._stTick) < 60)) {
  return npc._st;
}
```
- **Rule:** Only call `STATS.dirty(npc)` or `HC.bump(npc)` when an NPC's equipment, cultivation stage, techniques, injuries, or buffs actually change.

### 2.2 Passive & Equipment Resonance Set Caches (`js/martial.js` & `js/combat.js`)
- `MARTIAL.aggregatePassives(npc)` caches on `npc._pass` keyed by `npc._passVer` (`techs.length` + weapon/armor/accessory IDs + cultivation stage + `_ver`).
- `COMBAT.evaluateEquipmentSets(npc)` caches on `npc._eqSetCache` keyed by equipped item IDs (`wId|aId|accId`).
- `ELEM.combatElementPower(npc, el)` caches on `npc._elemPowerCache` keyed by `npc._ver` + stage + root count.

### 2.3 Population & Stock Intelligence Caching (`js/economy.js` lines 614–654)
- `W._alivePopCount` is cached per tick (`W._alivePopTick === W.t && W._alivePopLen === W.npcs.length`).
- `ECO.inventoryIntelligence(W)` is cached per day (`evaluatedAt === W.day`) unless `W.sect._stockDirty` is set.
- `CPE.personalCraftChoice(W, n)` is cached on `n._pcTick === W.t && n._pcVer === n._ver && n._pcMatSum === matSum`.

---

## 3. Hot-Path Allocation & Complexity Rules (`js/ai.js`, `js/cognition.js`, `js/combat.js`)

1. **No `JSON.stringify` / `JSON.parse` in Tick/Hourly/Daily Loops:**
   - Only `SIM.serialize` / `SIM.deserialize` and Edit Hub Undo snapshots may use JSON serialization.
2. **Avoid `Array.prototype.filter/map/reduce` Chains Inside `SIM.tick`:**
   - In functions called every tick for every NPC (`AI.step`, `AI.needs`, `COMBAT.tick`, `WILD.tick`), use indexed `for (let i = 0; i < arr.length; i++)` loops and early `return`/`continue` guards (`if (n.dead || n.away) continue;`).
3. **Stagger Heavy Evaluations Across Ticks or Days:**
   - NPC utility decision-making (`AI.decide`) only runs when an NPC finishes its current action (`n.act.left <= 0`), not every tick.
   - Heavy sect-wide evaluations (`COG.syncOfficeAuthority`, `CPE.daily`, `SECT.daily`, `ECO.inventoryIntelligence`) run once per day in `SIM.dailyUpdate(W)` or staggered by `(W.t + n.n * 13) % 60 === 0`.
4. **Cap Unbounded Arrays:**
   - Always cap history/log arrays: `W.logs` (`<= 1500`, splice 400), `W.sect.ledger` (`<= 400`, splice 200), `n.h.life.bio` (`<= 70`, splice 20), `c.hist` (`<= 60`), `c.log` (`<= 40`), `n.cognition.memory` (`<= 24`), `n.cognition.trace` (`<= 15`).

---

## 4. Performance Verification Suite
Always run the 80x benchmark after modifying any tick/hourly/AI/combat code:
```bash
node GAME_SOURCE/test/test_perf_80x_benchmark.js
node GAME_SOURCE/tools/benchmark_80x.js
```
