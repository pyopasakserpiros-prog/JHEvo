# Time, Speed & Map Architecture Contract (`JS2-v2.6.0` Life Traits & 360×304 Sect Expansion)

## 1. Expanded Sect Compound & Wilderness Geometry (`360×304`)
- **Canvas & Grid Dimensions**:
  - `MAP.W = 360`, `MAP.H = 304`, `MAP.H_BASE = 248`, `MAP.TILE = 16`, `MAP.OX = 84`, `MAP.OY = 56` (`109,440` total tiles, `2.37×` larger than legacy `240×192`).
- **Inner Compound Wall & Sacred Axis**:
  - `WX0 = 72`, `WY0 = 56`, `WX1 = 288`, `WY1 = 204` (`216×148` inner compound).
  - Central Axis: `x = 180` (`96 + OX`), Central Plaza: `x = 164..196, y = 114..132`, Plaza Center `(180, 123)`.
- **Four Directional Wall Gates (`MAP.WALL_GATES`) & Gate Outposts**:
  - **South Gate (`S`, Main)**: `(180, 204)`, `MAP.GATE_IN = (180, 196)`, `MAP.EXIT = (180, 298)`, `gate` (`x=174, y=200, w=12, h=5`).
  - **North Gate (`N`, Back Mountain)**: `(180, 56)`, `gate_north` (`x=176, y=54, w=8, h=4`).
  - **West Gate (`W`, Bamboo & Beast Pass)**: `(72, 123)`, `gate_west` (`x=70, y=120, w=4, h=6`).
  - **East Gate (`E`, Spirit Cliff Pass)**: `(288, 123)`, `gate_east` (`x=286, y=120, w=4, h=6`).
- **8 Sacred Peak Terraces (`PEAK_LAYOUT_SPECS`) & 8 Expansion Plots (`MAP.PLOTS`)**:
  - All 8 peaks sit on dedicated outer-ring compound terraces (`y=60..191`, `x=78..281`) with zero road overlap (`0` blocked road tiles) and zero building-to-building overlap.
  - Dynamic building expansion (`MAP.expandBuilding`) increments `M.topologyRev`, automatically invalidating stale cached paths in `MAP.findPath`.
- **True 4-Gate Routing (`MAP.findPath`)**:
  - Evaluates total Manhattan distance (`NPC → Gate + Gate → Target`) across all 4 directional gates (`S, N, W, E`), picks the shortest valid gate, and falls back to alternative open gates if a gate approaches blocked tiles.
- **Southern Spirit River (`MAP.RIVER_BELT`) & Fishing Stations**:
  - `MAP.SAFE_BELT = { x0: 120, x1: 240, y0: 204, y1: 230 }`.
  - `MAP.RIVER_BELT = { x0: 56, x1: 300, y0: 254, y1: 284 }`, centerline `y ≈ 268`, 3 stone bridges (`x = 92..94`, `x = 178..182`, `x = 264..266`), 4 fishing zones with `26` walkable bank tiles adjacent to water.
- **8 Physical Beast Dens (`W.wildlife.dens`)**:
  - Persistent wilderness structures across all 4 directions (`DEN_NORTH_RIDGE`, `DEN_NORTH_ABYSS`, `DEN_WEST_BAMBOO`, `DEN_WEST_MIASMA`, `DEN_EAST_CLIFF`, `DEN_EAST_THUNDERTREE`, `DEN_SOUTH_MARSH`, `DEN_SOUTH_RIVERBANK`) with obstacle-checked beast movement (`!MAP.blocked(M, nx, ny)`).
- **Legacy Save Migration (`240×192` → `360×304`)**:
  - Automatically detects pre-expansion saves (`savedMapW < 360 || savedMapH < 304`) and shifts interior compound entities by `(+62, +42)` (`OX: 22 → 84`, `OY: 14 → 56`), clamping all coordinates to walkable tiles and clearing stale movement paths.

## 2. 1.5× Day Length & Boundary-Once Time Contract
- **Time Constants**:
  - `SIM.DAY_FACTOR = 1.5`
  - `SIM.CALENDAR_MINS_PER_DAY = 1440` (`24 × 60` calendar minutes)
  - `SIM.WORK_STEPS_PER_DAY = 2160` (`1440 × 1.5` NPC activity/movement ticks per calendar day)
- **Sub-Minute Fractional Accumulator**:
  - Each `SIM.tick(W)` advances `W.workSteps += 1` and `W.timePhase += 1 / SIM.DAY_FACTOR` (`+2/3` calendar minute per work-step).
  - Calendar minute `W.minute` increments only when `W.timePhase >= 1.0`, setting `W._isNewCalendarMinute = true` on those exact `1440` ticks per day (`2` out of every `3` work-steps).
  - All calendar boundary hooks (`W.minute === 0` hourly upkeep, `W.hour === 0 && W.minute === 0` daily reset, wildlife spawn/season checks, scheduled duels, sect events) are guarded by `W._isNewCalendarMinute` so they fire **strictly once** per calendar hour/day/month/year.
- **Metabolic & Progression Balance**:
  - Passive hunger/rest drain per work-step is scaled by `1 / SIM.DAY_FACTOR` so total daily caloric and sleep needs remain identical per calendar day while NPCs enjoy `50%` more active walking, gathering, hunting, socializing, and training steps per day.

## 3. 96× Simulation Speed & Render Throttling Contract
- **Speed Tiers**:
  - `UI.SPEEDS = [0, 1, 2, 4, 8, 16, 32, 48, 96]`
- **Frame Loop & Render Throttling (`main.js`)**:
  - `MAX_CATCHUP_TICKS`: `14` at `96×`, `10` at `48×`, `8` at `32×`, `6` at lower speeds.
  - `RENDER_STRIDE_MS`: `50ms` (~20 FPS canvas draw) at `96×`, `33ms` (~30 FPS) at `48×`, freeing main-thread budget for `SIM.tick` while keeping UI buttons, touch events, and pause (`0×`) instantaneously responsive.
