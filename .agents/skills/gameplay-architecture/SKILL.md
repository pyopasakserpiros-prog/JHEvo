---
name: gameplay-architecture
description: Master the system architecture, 40-script-tag load invariant, global namespace (g.*), single-state object (W), tick/hour/day simulation lifecycle (js/sim.js), sect facilities (js/sect.js), and single-file build pipeline (tools/build_single.js) of JianghuSect Evolution.
origin: jianghusect-custom
category: engine-architecture
---

# JianghuSect Engine Architecture: Module Graph, Invariants & Simulation Loop

## Purpose
Define the non-negotiable architectural invariants, module load order, state ownership (`W`), and simulation tick flow of **JianghuSect Evolution (JHEvo)**.

Use this skill whenever:
- Touching multiple engine modules (`js/*`, `data/*`) or planning a new patch feature
- Adding new sect facilities, policies, doctrines, or world events
- Rebuilding `GAME_SOURCE/JianghuSect_single.html` via `node tools/build_single.js`
- Debugging cross-module initialization, circular dependencies, or global namespace (`g.*`) exports

---

## 1. Non-Negotiable Architectural Invariants

1. **Immutable `human_core.js` Lock**:
   - `GAME_SOURCE/js/human_core.js` MUST NEVER BE MODIFIED.
   - `HC.FINGERPRINT === '155:2f9c9dd7'` and SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` are verified by `test/core_lock.js`.
2. **Exact 40 `<script>` Tag Load Invariant**:
   - `GAME_SOURCE/index.html` and `GAME_SOURCE/test/load.js` load an exact, deterministic sequence of **40 `<script>` tags** (data files first, then core utilities, then domain modules, then `ui.js`, `render.js`, `main.js`).
   - **NEVER add or remove `<script>` tags** in `index.html` or create new external `.js` files in `js/` or `data/`—always extend the existing modules!
3. **Dual Browser/CommonJS IIFE Pattern**:
   - Every module wraps its code in `(function (g) { 'use strict'; ... })(typeof globalThis !== 'undefined' ? globalThis : this);`
   - Attaches its namespace to `g.<MODULE>` (e.g., `g.U`, `g.HC`, `g.CULT`, `g.ECO`, `g.SECT`, `g.AI`, `g.COG`, `g.COMBAT`, `g.SIM`, `g.UI`, `g.RENDER`).
   - Works identically in a browser (`index.html` / `JianghuSect_single.html` with zero bundler dependencies) and in Node.js (`test/load.js`).
4. **Single Source of Truth (`W`)**:
   - All runtime world state lives inside the single world object `W` (`W.t`, `W.day`, `W.rng`, `W.map`, `W.sect`, `W.npcs`, `W.byId`, `W.fights`, `W.market`, `W.world`, `W.logs`).
   - Never store mutable world state in module-level globals that survive across `SIM.create()` or `SIM.load()` calls!

---

## 2. Module Ownership Map (`GAME_SOURCE/`)

| Layer | Files | Global Exports & Responsibility |
| :--- | :--- | :--- |
| **Data (`data/`)** | `data_core.js`, `data_cult.js`, `data_martial.js`, `data_items.js`, `data_expansion.js`, `data_cp.js`, `data_bt.js`, `data_cb.js`, `data_beasts.js`, `data_ecology.js`, `data_tech.js` | Populates `g.JD` (`JD.CORE`, `JD.CULT`, `JD.MARTIAL`, `JD.ITEMS`, `JD.BEASTS`, etc.). Pure static definitions. |
| **Foundation** | `js/util.js`, `js/human_core.js` | `g.U` (PRNG `U.RNG`, math/string helpers), `g.HC` (12-layer human stat/modifier engine). |
| **Progression & Combat** | `js/cultivation.js`, `js/bottleneck.js`, `js/proficiency.js`, `js/retraining.js`, `js/martial.js`, `js/skills.js`, `js/stats.js`, `js/combat.js` | `g.CULT`, `g.ELEM`, `g.BN`, `g.PROF`, `g.RETRAIN`, `g.MARTIAL`, `g.SKILLS`, `g.STATS`, `g.COMBAT`. |
| **World & Ecology** | `js/world_map.js`, `js/wildlife.js`, `js/wild_resources.js`, `js/fishing.js`, `js/explore.js`, `js/expedition.js`, `js/visitors_clues.js` | `g.MAP` (240×192 grid, buildings, stations), `g.WILD`, `g.WILD_RES`, `g.FISHING`, `g.EX`, `g.EXPED`, `g.VC`. |
| **Economy & Sect** | `js/economy.js`, `js/cpeco.js`, `js/external_market.js`, `js/content.js`, `js/sect.js`, `js/knowledge.js` | `g.ECO`, `g.CPE`, `g.EXT_MKT`, `g.CONTENT`, `g.SECT` (14 archetypes, offices, diplomacy, ancestral shrine, 3 specialist facilities), `g.KNOW`. |
| **NPC Brain** | `js/cognition.js`, `js/ai.js` | `g.COG` (aspirations, goals, bounded awareness), `g.AI` (utility scoring, needs, pathfinding, station reservation). |
| **Simulation & UI** | `js/sim.js`, `js/ui.js`, `js/render.js`, `js/main.js` | `g.SIM` (clock, tick loop, save/load), `g.UI` (DOM panels, sheets, Edit Hub), `g.RENDER` (Canvas 2D map & entity rendering). |

---

## 3. Simulation Tick Cadence (`js/sim.js` — `SIM.tick`)

In JianghuSect, **1 tick = 1 game minute** (`1440 ticks = 1 day`, `360 days = 1 year`):
- **Every Tick (1 min)**:
  - Advances `W.t` and updates `W.day = Math.floor(W.t / 1440)` and `HC.nowDay = W.day`.
  - Runs `AI.step(W, npc)` for every living NPC (`AI.needs`, `AI.interrupt` every 5 mins, movement, or activity `tick`).
  - Steps active fights (`COMBAT.tickFights`), wildlife movement, and active expeditions.
- **Every Hour (`W.t % 60 === 0`)**:
  - `AI.healTick(W, npc)`, facility upkeep, specialist facility ticks (`CULT.menagerieTick`), external market arrivals/departures, and threat/raid checks.
- **Every Day (`W.t % 1440 === 0`)**:
  - Daily sect ledger, welfare/salary distribution, natural ecology/fishing pool recovery, diplomacy updates, and age/lifespan checks.

---

## 4. Standalone Build Pipeline (`tools/build_single.js`)

Whenever any file in `GAME_SOURCE/js/`, `GAME_SOURCE/data/`, `GAME_SOURCE/css/`, or `GAME_SOURCE/index.html` is modified:
```bash
cd GAME_SOURCE && node tools/build_single.js
```
This inlines all CSS, 40 JS scripts, and base64 assets (`assets/wuxia_item_atlas.png`) into `GAME_SOURCE/JianghuSect_single.html` so the user can open the game directly in any browser without a web server.

---

## 5. Verification Checklist

```bash
node GAME_SOURCE/tools/build_single.js
node GAME_SOURCE/test/core_lock.js
node GAME_SOURCE/test/standalone.js
node GAME_SOURCE/test/runtime_timing.js
node GAME_SOURCE/test/speed_controls.js
node GAME_SOURCE/test/time_controls.js
```
