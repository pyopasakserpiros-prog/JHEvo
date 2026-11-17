# Patch Implementation Report — Life-Experience Traits, Action Masteries, 360×304 Sect Expansion, 1.5× Day Length & 96× Speed (`JS2-v2.6.0` Next Patch)

## 1. Executive Summary
This patch delivers all **4 Pillars** (`T01`–`T07`, `M01`–`M06`, `D01`–`D04`) directly on top of the **Living Jianghu Epithets (`274` runtime epithets)** and **Living Hunt Variety (`125` land beast species / `241` pool entries)** baseline while strictly preserving all core invariants (`HC.FINGERPRINT === '155:2f9c9dd7'`, `AGENTS.md` SHA-256 unchanged, 40 `<script>` tags intact, `validate_data_schema.js` 0 errors / 0 warnings, and `JianghuSect_single.html` rebuilt cleanly).

---

## 2. Pillar 1: Life-Experience Traits & Behavioral Action-Mastery Traits (`T01`–`T07`)
- **Full Proposal Evaluation & Registry (`88` Cataloged Items)**:
  - Audited all **72 proposals** from `TRAIT_01B.pdf` (`E093–E120` = 28 items, `F121–F144` = 24 items, `G145–G164` = 20 items), plus 6 existing `CULT.EXPERIENCE_TRAITS`, 4 existing `COMBAT.ACTION_MASTERY_TRAITS`, and 6 Codex Life-Rhythm & Resilience additions (`CODEX_01`–`CODEX_06`).
  - Documented every decision, runtime hook, threshold, working effect, cap/exclusion, recovery rule, UI surface, and test evidence in `docs/handovers/LIFE_TRAITS_72_REVIEW_TRACKER.csv` and `docs/audits/LIFE_TRAITS_ACTIVE_REGISTRY.md`.
- **Strict Birth-Pool Guard (`T02`)**:
  - Marked all Group E acquired destiny traits (`TR_AC_*`) with `birthEligible: false` and `category: 'ACQUIRED'` in `JD.CORE.curatedTraits`.
  - Enforced `CULT.EXPERIENCE_TRAITS.stripBirthIneligibleTraits(npc)` during NPC creation so newly generated disciples never spawn with `TR_AC_*`, `EXP_TRAIT_*`, or `TRAIT_*` masteries.
- **36 Life-Experience Traits with Wisdom-Preserving Recovery & Episode Watermarks (`T03`, `T05`)**:
  - Expanded `CULT.EXPERIENCE_TRAITS.CATALOG` from 6 to **36** traits (`6` core + `24` Group F + `6` Codex additions).
  - Upgraded `CULT.EXPERIENCE_TRAITS.resolveTraitRecovery(W, npc, traitId, reasonTh)` so recovery sets `burdenActive = false` and `recovered = true` (removing `consF` drawbacks while retaining `p`, `f`, and `cultRateMult` wisdom permanently) and advances `episodeWatermarks[eventKind]` so historical counts never immediately re-trigger burdens.
- **24 Behavioral Action-Mastery Traits with Autonomous 3-Slot Active Cap (`T04`, `T06`)**:
  - Expanded `COMBAT.ACTION_MASTERY_TRAITS.TRAIT_DEFS` from 4 to **24** combat & battlefield masteries (`4` core + `20` Group G).
  - Implemented `COMBAT.ACTION_MASTERY_TRAITS.reconcileActiveMasteries(W, npc)` enforcing `MAX_ACTIVE_MASTERIES = 3` (`activeMasteryIds`, max 3 active at once with hysteresis, while `unlockedTraits` retains unlimited lifetime mastery history).
  - Wired `TRAIT_NONLETHAL_SUBDUER` (`G163`) into `COMBAT` so merciful/spar subdues clamp defeated human opponents at `>= 1 HP`.
- **Inspect UI (`T07`)**:
  - Updated `UI.rNpc` in `GAME_SOURCE/js/ui.js` to display **Active Burdens (`กำลังแบกปม`)** vs **Recovered Wisdom (`คลายปมแล้ว • คงบทเรียน`)** and **Active Action Masteries (`ใช้งาน X/3`)** vs **Stored Lifetime Masteries (`คลังความชำนาญที่เคยบรรลุ`)**.

---

## 3. Pillar 2: 360×304 Sect Compound & Wilderness Expansion (`M01`–`M06`)
- **Expanded Grid & Sect Compound (`M01`, `M02`)**:
  - Expanded `MAP.W = 360`, `MAP.H = 304`, `MAP.H_BASE = 248`, `MAP.OX = 84`, `MAP.OY = 56` (`109,440` tiles, `2.37×` area).
  - Expanded inner compound wall to `WX0 = 72, WY0 = 56, WX1 = 288, WY1 = 204` (`216×148` inner compound), keeping the sacred axis at `x = 180` and central plaza at `(180, 123)`.
  - Positioned all **8 Sacred Peaks** (`PEAK_LAYOUT_SPECS`) on spacious outer-ring terraces inside the compound with zero road or building overlaps, expanded `MAP.PLOTS` from 4 to **8**, and added 4 directional gate outposts (`gate_north`, `gate_west`, `gate_east`, plus main `gate`).
- **True 4-Gate Dynamic Pathfinding & Topology Invalidation (`M03`)**:
  - Upgraded `MAP.findPath` to evaluate total path distance across all 4 directional gates (`S: (180,204)`, `N: (180,56)`, `W: (72,123)`, `E: (288,123)`), automatically falling back to open gates if a gate is blocked and invalidating cached paths via `M.topologyRev` whenever a building expands.
- **Southern Spirit River (`M05`) & 8 Physical Beast Dens (`M04`, `M06`)**:
  - Shifted Southern Spirit River to `y ≈ 268` (`MAP.RIVER_BELT = { x0: 56, x1: 300, y0: 254, y1: 284 }`) with 3 stone bridges (`x = 92..94`, `x = 178..182`, `x = 264..266`) and 4 fishing zones (`26` walkable fishing stations).
  - Scaled `WILD.zones` and `WILD_RES.ZONES` across the 4-directional wilderness, added **8 persistent physical Beast Dens** (`W.wildlife.dens`), enforced `!MAP.blocked` on beast movement, upgraded `COG.huntValue` with realm-matching so elders leave T1–T2 critters to outer disciples, and added minimap beast/fight markers + spectator camera-focus button (`focus-wild-fight`).

---

## 4. Pillar 3 & 4: 1.5× Day Length (`2160` Work-Steps/Day) & 96× Speed (`D01`–`D04`)
- **1.5× Day Length (`SIM.DAY_FACTOR = 1.5`, `SIM.WORK_STEPS_PER_DAY = 2160`)**:
  - Implemented sub-minute fractional phase (`W.timePhase += 2` per work-step; calendar minute `W.t` increments every `W.timePhase >= 3`, setting `W._isNewCalendarMinute = true` on `1440` steps out of `2160` per day).
  - Guarded all daily, hourly (`W.t % 60 === 0`), monthly, yearly, scheduled duel, and wildlife spawn/tick hooks with `W._isNewCalendarMinute` so calendar events fire strictly once per boundary.
  - Scaled per-work-step passive hunger/rest drain by `1 / SIM.DAY_FACTOR` so NPCs eat and sleep the normal number of times per calendar day while enjoying 50% more travel and activity work-steps.
- **96× Simulation Speed (`UI.SPEEDS = [0, 1, 2, 4, 8, 16, 32, 48, 96]`)**:
  - Added `96×` to `UI.SPEEDS`, configured high-speed render throttling (`50ms` / ~20 FPS canvas draw at `96×`) in `main.js` so simulation ticks get maximum CPU budget while pause/touch inputs remain responsive, and updated `#speedBar` CSS to fit all 9 speed buttons on mobile and desktop.
- **Legacy Save Migration (`240×192` → `360×304`)**:
  - Automatically migrates pre-expansion saves by shifting interior compound entities by `(+62, +42)` (`OX: 22 → 84`, `OY: 14 → 56`), clamping coordinates to walkable tiles, and clearing stale cached paths.
