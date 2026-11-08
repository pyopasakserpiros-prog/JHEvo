---
name: performance-budgeting
description: Use when investigating JianghuSect simulation speed, NPC tick cost, caches or performance regressions.
origin: jianghusect-custom
category: performance-engineering
---

# JianghuSect Evolution — Simulation Performance Budgeting Blueprint (`< 3.0 ms/tick` at 80 NPCs)

> **Current baseline 4.0.0 (updated from 2.0.28–3.6.0):** This project-specific skill contains historical material from earlier versions. The targeted corrections below do not certify every older formula or API. Before implementing, verify the relevant behavior against current source and tests; use `project_status_and_ai_onboarding.md` for the current feature inventory and `AGENTS.md` for project rules.

This skill enforces the strict simulation CPU budget of **JianghuSect Evolution (สำนักยุทธ์เจียงหู) v2.0.17**: **`< 3.0 ms/tick` average across 80+ active NPCs**, enabling smooth **48×–80×+** fast-forward speeds on both mobile (Termux/Android) and desktop browsers.

---

## 1. Frame & Tick Budget Architecture (`js/main.js` & `js/sim.js`)

- **Frame Simulation Budget (`js/main.js` lines 6, 47–57):**
  - `TICKS_PER_SEC = 4`, `SIM_BUDGET_MS = 12` ms per `requestAnimationFrame`.
  - Pending ticks accumulate in `G.acc += dt * G.speed * TICKS_PER_SEC`.
  - The `while (G.acc >= 1)` loop breaks immediately if `performance.now() - t0 >= SIM_BUDGET_MS` so touch/pan gestures never freeze on mobile.
  - Remaining fractional and integer ticks persist safely in `G.acc` and `W.runtimeTiming.pendingTicks`.
- **Per-Tick Budget Target:**
  - At `80 NPCs`, each `SIM.tick(W)` must complete in **`< 3.0 ms`**.
  - Verified by headless timing test `test/runtime_timing.js` and benchmark suites.

---

## 2. Versioned Caching Patterns (Zero-Redundant Recomputation)

Never recompute composite stats, passive effects, equipment resonance sets, or elemental power on every tick or combat strike. Always guard with version counters:

### 2.1 `STATS.get(npc)` cache (`js/stats.js`)
`STATS.get` checks `n._cs` using time-to-live, earliest buff expiry, equipped item references, version, cultivation, passive cache key, health/energy and injury count. `compute` and `computeFast` are private helpers; inspect the actual invalidation rules before changing them. Do not treat an old `_csVer`/`_csExpires` snippet as the current API.

### 2.2 Resonance & Passives Caching (`js/martial.js` & `js/elemental.js`)
- **Equipment Resonance Sets (`MARTIAL.evaluateResonanceSet`):** Cached on `npc._eqSetCache` keyed by `npc._ver` + gear IDs.
- **21-Relic Trinity Resonance (`MARTIAL.evaluateLegendaryRelicResonance`):** Cached on `npc._legendaryResonanceCache` keyed by equipped relic UIDs and star attunements (`relic.stars`).
- **Passive Reconciler (`MARTIAL.reconcilePassives`):** Bails out immediately if `npc._passVer === npc._ver`.
- **Elemental Power (`ELEM.computePower`):** Cached on `npc._elemPowerCache` keyed by `npc._ver` + stage + root count.

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

## 4. Performance Verification Suites
Run from `GAME_SOURCE/`:
```bash
node test/runtime_timing.js
node test/perf.js
node test/browser_mobile_perf.js
node test/long_simulation.js
```
*(Note: Browser performance suites require a working browser and may fail when Chromium is unavailable; report the actual result).*

---

## Patch v4.0.0 Performance Verification (`80 NPCs <= 3.5 ms/tick`)
- In `v4.0.0`, `SECT.OUTPOSTS_LOGISTICS.tickOutpostLogistics(W)` executes once per day in `SECT.daily(W)`, `COMBAT.ACTION_MASTERY_TRAITS` uses O(1) counter increments and invalidates `STATS.dirty(npc)` only on threshold unlock, and `CULT.rate(npc)` caches base rates in `_cultRateBase`.
- Verified 80-NPC tick speed in `test/v400_living_frontier_and_sect_charter_suite.js`: **`0.700 ms/tick`** (5× faster than the `3.5 ms/tick` ceiling).


## JianghuSect 2 v2.0.0 Note (The 27 Grand Dao Epoch)
- **Patch / Schema**: `SIM.PATCH_VERSION = '2.1.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.1.0-grand-dao-debates-apex-trials'`
- **Scale**: 27 Major Cultivation Paths (`3^3`), 222 Subpaths, `CULT.MORTAL_INITIATION`, `SECT.PATH_LIBRARY` (1 starter path + 27 Manuals + 27 Crystals), 6 new weapon classes (`ROSARY`, `CLAW`, `NEEDLE`, `FAN`, `ASTROLABE`, `ABACUS`), 15 new Composable Triggers & Actions, 137/137 test suites passing.
