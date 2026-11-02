---
name: gameplay-architecture
description: Master the system architecture, 40-script-tag load invariant, global namespace (g.*), single-state object (W), tick/hour/day simulation lifecycle (js/sim.js), sect facilities (js/sect.js), and single-file build pipeline (tools/build_single.js) of JianghuSect Evolution.
---

# JianghuSect Evolution — System Architecture & Simulation Lifecycle Blueprint (`js/sim.js`, `js/sect.js`, `index.html`, `test/load.js`)

This skill governs the global module architecture, the 40-script-tag load invariant, the single authoritative world state (`W`), the tick/hour/day/month simulation loop (`js/sim.js`), sect facility expansion (`SIM.expandStations`), and the single-file offline build pipeline (`tools/build_single.js`).

---

## 1. The 40-Script-Tag Load Order Invariant (`index.html` & `test/load.js`)

JianghuSect Evolution uses zero external bundlers. Every file is an IIFE `(function (g) { 'use strict'; ... })(typeof globalThis !== 'undefined' ? globalThis : this);` attaching its namespace to `g`.

### 1.1 Exact Load Sequence (`test/load.js` line 4 & `index.html`)
1. **11 Data Modules (`g.JD`):**
   `data/data_core.js` → `data/data_cult.js` → `data/data_items.js` → `data/data_bt.js` → `data/data_cb.js` → `data/data_cp.js` → `data/data_tech.js` → `data/data_beasts.js` → `data/data_expansion.js` → `data/data_martial.js` → `data/data_ecology.js`
2. **26 Core Simulation & Domain Modules (`test/load.js`):**
   `js/util.js` (`U`) → `js/human_core.js` (`HC`) → `js/world_map.js` (`MAP`) → `js/cultivation.js` (`CULT`, `ELEM`) → `js/economy.js` (`ECO`) → `js/sect.js` (`SECT`) → `js/ai.js` (`AI`) → `js/combat.js` (`COMBAT`) → `js/expedition.js` (`EXPED`) → `js/explore.js` (`EXPLORE`) → `js/bottleneck.js` (`BN`) → `js/skills.js` (`SK`) → `js/stats.js` (`STATS`) → `js/cpeco.js` (`CPE`) → `js/external_market.js` (`EXT`) → `js/content.js` (`CONTENT`) → `js/martial.js` (`MARTIAL`) → `js/proficiency.js` (`PROF`) → `js/knowledge.js` (`KNOW`) → `js/retraining.js` (`RETRAIN`) → `js/cognition.js` (`COG`) → `js/wildlife.js` (`WILD`) → `js/wild_resources.js` (`WILD_RES`) → `js/sim.js` (`SIM`) → `js/visitors_clues.js` (`VC`) → `js/fishing.js` (`FISHING`)
3. **3 Browser-Only Modules (`index.html` only):**
   `js/render.js` (`Render`) → `js/ui.js` (`UI`) → `js/main.js` (`G`)

> **Strict Invariant:** Never add or remove `<script>` tags in `index.html` or `test/load.js` (`test_overhaul_pack.js` enforces `scriptTags.length === 40`). Always extend existing modules in place.

---

## 2. Single Source of Truth (`W`) & World Creation (`SIM.create` lines 146–218)

### 2.1 Calendar & Time (`js/sim.js` lines 10–13)
- `1 tick = 1 game minute`, `1440 ticks = 1 day`, `30 days = 1 month`, `360 days = 1 year (4 seasons × 90 days)`.
- `SIM.calendar(t)` returns `{ day, year, month, dom, season, hour, minute }`.

### 2.2 Authoritative `W` State Structure (`SIM.create`)
- **Top-Level Fields:** `v`, `seed`, `rng` (`new U.RNG(seed + ':world')`), `t`, `day`, `season`, `speed`, `npcs`, `byId`, `logs`, `logSeq`, `seqN`, `fights`, `foes`, `foeById`, `duelQueue`, `graveyard`, `gone`, `deaths`, `avgSat`, `avgMood`, `weather`, `market`, `sect`, `world`, `threat`, `explore`, `wildlife`, `wildResources`, `fishing`, `map`.
- **Sect State (`W.sect`):** `name`, `archetype`, `masterId`, `deputyId`, `posts`, `policy`, `stock`, `gear`, `stones`, `ledger`, `recipeTier`, `library`, `crystals`, `unlockedSubs`, `fame`, `cd`, `lastDuty`, `orders`, `guardRoster`, `buyList`, `reserveDirectives`, `shortageDirectives`, `welfareHistory`, `assemblyHistory`, `catalysts`, `menagerie`, `reservePets`, `supportDoctrine`, `specialistFacilities`.

---

## 3. Simulation Lifecycle (`SIM.tick`, `SIM.hourly`, `SIM.dailyUpdate`, `SIM.monthly`)

### 3.1 Per-Tick Loop (`SIM.tick(W)` lines 290–308)
1. `g.STATS.now = W.t; W.t++;`
2. If `Math.floor(W.t / 1440) !== W.day`, advance `W.day`, update `HC.nowDay = d`, and run `SIM.dailyUpdate(W)`.
3. Iterate `W.npcs`:
   - Skip `n.dead`.
   - If `n.travel`: update `n.px = n.x; n.py = n.y`, run `AI.needs(W, n)`, `EXPED.travelStep(W, n)`, and if `n.away && n.exiled`, call `SIM.retire(W, n)`.
   - If `!n.away`: execute `AI.step(W, n)`.
4. Run `WILD.tick(W)`, `WILD_RES.tick(W)`, `EXPED.raidTick(W)` (if `W.foes.length`), `WILD.clampCombat(W)`, and `COMBAT.tick(W)`.
5. Every 60 ticks (`W.t % 60 === 0`), run `SIM.hourly(W)`.

### 3.2 Hourly Loop (`SIM.hourly(W)` lines 325–375)
- Purges expired timed buffs (`STATS.purgeExpired(n, W.t)`), applies `vitalRegen` buff (`+5% hpMax`), cools down/recharges `MECH_PUPPET` constructs (`ms.heat`, `ms.charge`, `ms.integrity`), ticks `AI.healTick`, `STATS.recover`, `CPE.autoUse`, and weapon durability loss in combat (`-0.5 dur`).
- Completes finished building upgrades (`W.t >= b.building.until` → `SIM.finishBuilding(W, b)`), tracks facility station congestion (`W.sect.facilityDemand`), runs `EXPED.hourly(W)`, and distributes sect armory gear every 6 hours (`W.t % 360 === 0`).

### 3.3 Daily & Monthly Loop (`SIM.dailyUpdate(W)` lines 454–511)
- Rolls seasonal weather (`clear`, `cloud`, `rain`, `snow`, `fog`), checks natural old-age mortality (`age > life * 0.92`), buries dead NPCs after 4 days into `W.graveyard`, triggers `SECT.succession` if Master is dead, updates `SIM.guardRoster` & `SIM.assistants`, and runs:
  `SECT.daily(W)` → `COG.syncOfficeAuthority(W)` → `COG.reconcileLoadout(W, n)` → `EXPED.daily(W)` → `EXPLORE.daily(W)` → `BN.daily(W)` → `CPE.daily(W)` → `CONTENT.daily(W)` → `EXT.daily(W)` → `FISHING.daily(W)`.
- Handles orphaned pets of dead NPCs (moves to `W.sect.reservePets`), feeds hungry pets (`CULT.feedPet`), repairs `MECH_PUPPET` constructs, checks 9-Realm Track breakthroughs (`CULT.checkTrackGates` → `CULT.trackBreakthrough`), advances `SIM.researchTick(W)`, and buys emergency grain if food `< pop * 1.5`.
- On day-of-month 1 (`cal.dom === 1`), runs `SIM.monthly(W)` (`SECT.monthly`, `EXPED.caravan`, mortal cultivation awakening rolls).

### 3.4 Facility Expansion & Dormitory Cap (`SIM.expandStations` lines 397–446)
- **Authoritative Dormitory Bed Progression:** Only `SECT.HOUSING_IDS` (`dorm`, `elder_quarters`, `guest_quarters`) add `bed` stations (`56 + 28 + 16 = 100` max beds at L5). Non-housing buildings **never** add `bed` stations.

---

## 4. Single-File Build Pipeline (`tools/build_single.js`)
- Always rebuild `GAME_SOURCE/JianghuSect_single.html` after any code or data edit:
  ```bash
  cd GAME_SOURCE && node tools/build_single.js
  ```
- Verifies all 40 scripts inline cleanly into a standalone offline HTML bundle.
