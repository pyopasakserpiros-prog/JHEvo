---
name: performance-budgeting
description: Maintain JianghuSect Evolution's strict simulation performance budget (< 3.0 ms/tick for 80 NPCs, supporting 80x+ speed) through versioned caching (_ver, _passVer, earliestExpiry), allocation discipline, and tick throttling.
origin: jianghusect-custom
category: engine-performance
---

# JianghuSect Simulation Performance Budgeting (< 3.0 ms/tick @ 80 NPCs)

## Purpose
Keep **JianghuSect Evolution (JHEvo)** fast, responsive, and memory-stable during long multi-year simulations and high-speed (`10x`–`80x+`) playback (`js/sim.js`, `js/ai.js`, `js/stats.js`, `js/cognition.js`, `js/human_core.js`).

Use this skill whenever:
- Adding per-tick or per-hour logic in `js/sim.js`, `js/ai.js`, `js/combat.js`, or `js/cultivation.js`
- Modifying stat calculation (`STATS.combatStats`, `STATS.rating`, `HC.eff`, `HC.derived`)
- Adding new cognitive checks in `COG.prepare` or `COG.modifiers`
- Auditing tick times with `test/perf.js`, `test/soak.js`, or `test/browser_mobile_perf.js`

---

## 1. Hard Performance Targets

- **80-NPC Simulation Tick Budget**: **< 3.0 ms/tick** average in headless Chromium / Node.js (current v2.0.9 baseline: **~2.95 ms/tick**, supporting **84.7x** real-time speed).
- **Zero Memory Leaks over 360-Day Soak**: Bounded log arrays (`W.logs`), bounded NPC memory traces (`npc.h.mind.memories`, `npc.cognition.trace`), and zero orphaned closures.

---

## 2. Core Caching Mechanisms You MUST Preserve

### 2.1 `HC` Versioned Stat Cache (`npc._ver`, `npc._c`, `npc._d`)
- `HC.eff(npc, path)` and `HC.derived(npc)` cache their computed values on `npc._c` and `npc._d` keyed by `(HC.nowDay, npc._ver)`.
- **Rule**: Never increment `npc._ver` (or call `HC.bump(npc)`) on sub-integer per-tick training gains! Always use the wrapped `HC.trainBody`, `HC.trainMind`, and `HC.gainWisdom` in `js/ai.js`, which only bump `npc._ver` when `(oldVal | 0) !== (newVal | 0)`.

### 2.2 Composite Combat Stats & Buff Expiry Cache (`npc._cs`, `npc._passVer`, `earliestExpiry`)
- `STATS.combatStats(npc, nowT)` caches the full combat stat block on `npc._cs`.
- When timed buffs are active in `npc.buffs`, `npc._cs` records `earliestExpiry = Math.min(...buffs.map(b => b.until))`.
- On subsequent calls where `nowT < earliestExpiry` and `npc._ver` / `npc._passVer` haven't changed, `STATS.combatStats` returns `npc._cs` in **O(1) time** without re-scanning equipment, techniques, or buffs!

### 2.3 Per-Day Physiological Needs Rate Cache (`npc._nd` in `js/ai.js`)
- `getNeedsRates(npc)` caches metabolic drain, rest drain multiplier (`restDrainMult`), `qiMax`, and `hpMax` on `npc._nd` keyed by `(HC.nowDay, cStage, cTr, passVer, eqA, vit)`.
- This keeps `AI.needs(W, npc)` (which runs every minute for every living NPC) a fast arithmetic update.

---

## 3. Anti-Patterns to Avoid in Hot Paths

1. **No O(N²) NPC Scans Every Minute**:
   - Do not loop over all `W.npcs` inside a per-minute `AI.step(W, n)` hook unless gated by a Modulo Stagger (e.g., `if ((W.t + n.n) % 15 === 0)`) or triggered only on state transitions (`AI.decide`).
2. **No Full-Map (240×192) Scans in `can()` or `score()`**:
   - Always query pre-indexed station lists (`W.map.byId[buildingKey].stations`) via `AI.freeStation`.
3. **Bounded History & Trace Arrays**:
   - Whenever pushing to `npc.recent`, `npc.inj`, `npc.cognition.trace`, or `W.logs`, enforce a strict `.shift()` or `.slice(-MAX)` cap.

---

## 4. Verification Checklist

Run these performance and soak suites from `GAME_SOURCE/`:
```bash
node test/perf.js
node test/runtime_timing.js
node test/soak.js
node test/cp_soak.js
node test/long_simulation.js
node test/cultivator_sleep_scaling_suite.js
```
