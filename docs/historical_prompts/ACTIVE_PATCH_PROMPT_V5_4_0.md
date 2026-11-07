# ACTIVE PATCH PROMPT — Patch v5.4.0 (Era 5 Phase 5: Qinggong Locomotion, Sword Flight & Celestial Levitation Overhaul)

## Target Identifiers
- **Patch Version**: `5.4.0` (`SIM.PATCH_VERSION = '5.4.0'`)
- **Save Schema Version**: `5.4.0-qinggong-movement-and-flight` (`SIM.SAVE_SCHEMA_VERSION = '5.4.0-qinggong-movement-and-flight'`)
- **Prerequisite Baseline**: `v5.3.0` (`129/129` suites passed)

## Scope & Engineering Requirements

### 1. Six Tiered Qinggong & Locomotion Archetypes (`CULT.QINGGONG`)
Overhaul `LIGHTNESS_ART` and `MOVEMENT_TECHNIQUE` arts so they directly govern NPC locomotion in both the **Sect Map (`ในพื้นที่สำนัก`)** and **World Map Expeditions (`นอกสำนัก`)**:
1. **`SWIFT_STRIDE` (`ย่างก้าววายุกรด / วิ่งปราณทะยาน` — Stage 1+ / Tier 1–2)**:
   - High-speed wind-infused sprint (`×1.45` to `×1.55` speed), ignores rain/snow weather movement penalties, low Qi cost (`0.15 Qi/tick`, min Qi threshold `12%`), `-10%` expedition travel time.
2. **`LEAP_BOUND` (`ทะยานเมฆา / กระโดดไกลเหินเวหา` — Stage 2+ / Tier 2–3)**:
   - Long-distance parabolic bounding leaps (`×1.70` to `×1.82` speed), vaults across 2–3 path waypoints in a single aerial arc (`leapPhase`, `leapHeight`), moderate-low Qi cost (`0.28 Qi/tick`, min Qi `15%`), `-14%` expedition travel time & `-8%` hazard chance.
3. **`WATER_LOTUS_DRIFT` (`ย่างก้าวบัวขาวเหยียบคลื่น / ล่องวารีไร้รอย` — Stage 2+ / Tier 2–4)**:
   - Skims effortlessly across water, mud, and rough terrain (`×1.58` base speed, additional `×1.45` bonus on water/pond/river tiles), low Qi cost (`0.22 Qi/tick`, min Qi `14%`), `-15%` general expedition travel time and `-26%` travel time on river/water routes (`waterRouteMult: 0.74`).
4. **`SHADOW_BLINK` (`ก้าวพริบตาเงาพราย / ย่นระยะดารา` — Stage 3+ / Tier 3–5)**:
   - Phantom shadow-step and short-range spatial blink (`×1.95` to `×2.10` speed), leaves 3–4 translucent shadow afterimages and intermittently blinks across waypoints, moderate Qi cost (`0.42 Qi/tick`, min Qi `18%`), `-20%` expedition travel time & `-14%` hazard chance.
5. **`SWORD_FLIGHT` (`วิชาขี่กระบี่บินเหินเวหา — 御剑飞行` — Stage 3–6+ / Tier 3–6)**:
   - Mid-to-high tier cultivators stand atop an energized flying sword/spirit weapon (`×2.35` to `×2.50` speed) and fly along direct aerial paths across the sect map (`aerialDirectPath: true`).
   - **Authentic Tradeoffs vs. True Celestial Levitation (`มีข้อเสียมากกว่าบินได้เอง`)**:
     - **Weapon Dependency**: Requires an equipped `WEAPON` (or Sword/Metal Dao affinity) for full `×2.35` speed; without a weapon, must condense a temporary Qi blade at reduced efficiency (`×1.55` speed).
     - **High Qi Consumption**: Costs `0.75 Qi/tick` (`+0.25 Qi/tick` extra in rain/snow headwinds).
     - **Mental Focus & Turbulence Penalty**: Drains `0.012` energy/tick to control the flying sword and suffers `-15%` speed in storm/rain turbulence.
     - **Forced Landing (`exhaustedFallback`)**: Automatically lands when `s.qi < qiMax * 0.20` and remains grounded until Qi recovers above `35%`.
6. **`CELESTIAL_LEVITATION` (`วิชาเหาะเหินเดินอากาศเซียนอมตะ — 凭虚御风 / 踏空而行` — High Realm Stage 6–9 / Tier 6–7)**:
   - True high-realm immortal levitation (`×2.85` to `×3.10` speed) reserved for high-stage cultivators (Stage 6+ Nascent Soul / Divine Transformation / Immortal realms).
   - **Superiority over Sword Flight**:
     - Zero weapon requirement (walks directly on void/clouds).
     - Lower Qi drain (`0.35 Qi/tick`, less than half of Sword Flight) due to resonant heaven-and-earth Qi circulation.
     - Zero weather/storm penalty (`ignoreWeatherSlow: true`), zero energy focus drain, only lands if `s.qi < qiMax * 0.10` (recovers at `20%`).
     - Reduces World Map expedition travel time by `-35%`, reduces travel hazards by `-28%`, and boosts party carry capacity by `+35%`.

### 2. Signature Qinggong Manuals & Full Catalog Mapping
- Add 6 dedicated canonical Qinggong manuals in `JD.TECH.techniques` / `CULT.QINGGONG.TECH_CATALOG` (`QG_SWIFT_GALE_STRIDE_T1`, `QG_CLOUD_DRAGON_LEAP_T2`, `QG_JADE_LOTUS_WATER_DRIFT_T3`, `QG_PHANTOM_STAR_BLINK_T4`, `QG_IMPERIAL_SWORD_FLIGHT_T5`, `QG_IMMORTAL_VOID_LEVITATION_T7`) while preserving `JD.MARTIAL.techniques.length === 655`.
- Enrich all 29 existing `LIGHTNESS_ART` and `MOVEMENT_TECHNIQUE` arts across `JD.TECH.techniques` and `JD.MARTIAL.techniques` with `qinggongSpec` so every movement technique in the game activates its authentic locomotion mode.

### 3. Real-Time Sect Canvas Locomotion VFX (`js/render.js`)
- Render distinct visual signatures in `drawNpc`:
  - **`SWORD_FLIGHT`**: Glowing spirit sword beneath the NPC's feet, elevated hover offset (`-13px`), ground shadow separated below, and sword-qi contrail particles.
  - **`CELESTIAL_LEVITATION`**: Golden-jade immortal cloud & lotus halo beneath the feet, high-altitude float (`-17px`), flowing celestial ribbons, and radiant starlight trail.
  - **`LEAP_BOUND`**: Parabolic vertical jump arc (`leapOffsetY` up to `-18px`) with expanding wind rings at takeoff/landing.
  - **`WATER_LOTUS_DRIFT`**: Blooming emerald-jade lotus petals and concentric water ripples beneath the feet.
  - **`SHADOW_BLINK`**: 3–4 multi-layered translucent phantom afterimages trailing behind the NPC.
  - **`SWIFT_STRIDE`**: Wind-stream speed lines and dust vortexes at the heels.

### 4. Interactive UI Controls & Inspection (`js/ui.js`)
- Display active Qinggong mode, real-time speed multiplier, Qi drain rate, Sword Flight vs. Celestial Levitation status, and mode selector (`AUTO`, `SWORD_FLIGHT`, `CELESTIAL_LEVITATION`, `SHADOW_BLINK`, `LEAP_BOUND`, `WATER_LOTUS_DRIFT`, `SWIFT_STRIDE`, `MORTAL_WALK`) in both the NPC Inspector (`UI.rNpc`) and Sect Overview (`UI.rSect`).
