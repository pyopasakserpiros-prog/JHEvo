# Patch Report: JS2 v3.3.0 Tactical Combat & Six-Path Mastery (`3.3.0-tactical-sixpaths`)

## 1. Executive Summary
- **Patch Version**: `3.3.0` (`SIM.SAVE_SCHEMA_VERSION = '3.3.0-tactical-sixpaths'`, backward-compatible with `3.2.0-equipment-expansion`, `3.1.0-living-lore`, `3.0.0-living-continent`, and all legacy schemas).
- **Protected Invariants**:
  - `AGENTS.md` byte-identical (`67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`).
  - `GAME_SOURCE/js/human_core.js` byte-identical (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`).
  - Exact 40 `<script>` tags preserved across `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html`.
  - 100% autonomous NPC decision-making with zero player command buttons.

## 2. Category 1 — Tactical Combat Depth (`js/combat.js`, `js/cultivation.js`, `js/stats.js`)
- **Tactical Row Aura & Autonomous Row Swap**:
  - `C.evaluateRowTacticalBonus(W, f, u)`: Front-row units shielding a living back row gain **Phalanx Guard** (`-10%` damage taken, `+8%` def); protected back-row units gain **Unobstructed Focus** (`+9%` damage out, `+8` acc); exposed back-row units after a front-row collapse suffer **Line Broken** (`+10%` damage taken).
  - `C.tryAutonomousRowSwap(W, f, u)`: Battered front-row units (`< 28%` HP) autonomously swap rows with healthy (`>= 65%` HP) `TANK`/`FIGHTER`/high-courage back-row allies (16-tick ICD).
- **Expanded Duet Co-Cast (`C.DUET_CATALOG`: 8 → 12 Duets)**:
  - Added `DUET_PAIRED_RELIC_HARMONY` (triggers organically when caster and partner equip matching `v3.2.0` `pairedSetId` relics), `DUET_ANCESTRAL_ARCHIVE_OATH`, `DUET_FORTUNE_ARENA_GAMBIT`, and `DUET_TIDE_HUSBANDRY_BLOOM`.
- **Dedicated Secondary Resources (`C.SECONDARY_RESOURCES`, `S04`)**:
  - `FROST_QI`, `KILLING_INTENT`, `FORMATION_INK`, and `OVERDRIVE_GEARS` (`u.secRes`, save-safe), stacking to `5` from real combat hits and discharging tactical bursts (`chill+slow`, `critUp` burst, `shield+mdefbreak`, `haste` burst).
- **Weapon Affinity Ramp (`C.recordWeaponAffinityStrike`, `S05`)**:
  - Consecutive strikes with the same weapon UID ramp up to `8` stacks (`+12` acc, `+6%` crit in `ST`), resetting cleanly on weapon swap.
- **Toxin Synergy Matrix (`C.TOXIN_SYNERGY_MATRIX`, `S03`)**:
  - Overlapping status reactions (`poison + chill/slow` → `TOXIN_MARROW_DISSOLVE`, `bleed + burn` → `TOXIN_SEARING_WOUND`, `poison + bleed` → `TOXIN_VENOM_BLOOD`, 12-tick ICD).
- **Autonomous Martial Vows (`CULT.MARTIAL_VOWS`, `S07`)**:
  - 4 autonomous vows (`VOW_NO_PILL`, `VOW_NO_RETREAT`, `VOW_SOLO_DUEL`, `VOW_IRON_SILENCE`) adopted deterministically from `HC.eff` personality/values without overwriting existing `CULT.VOLUNTARY_VOWS`; breaches inflict `vowBacklash` and `+12` `heartDemon`.

## 3. Category 2 — Six-Path Deep Mastery & World-Loop Integration (`CULT.SIX_PATH_MASTERY`)
- Deep runtime mastery hooks across all 6 pathways (`ANCESTRAL_RITUAL`, `TIDE_VOYAGER`, `LORE_ARCHIVIST`, `FORTUNE_GAMBLER`, `SPIRIT_HUSBANDRY`, `ARENA_GLORY`) synced daily on `W._isNewCalendarMinute && W.t % 1440 === 0` with zero `W.rng` consumption:
  1. `ANCESTRAL_RITUAL`: Pulls up to 3 departed ancestors from `W.graveyard` (or founding lineage) into `marrowEchoes` for cumulative `def`/`mdef`/`atk`/`matk` bonuses.
  2. `TIDE_VOYAGER`: Builds `currentMark` (`1–3`) from rain/storm weather, fishing skill, and river proximity (`y >= 245`) for `move`, `eva`, `matk`, and yield bonuses.
  3. `LORE_ARCHIVIST`: Scales `loreIndexRank` (`1–5`) from `v3.1.0` `W.world.livingLore` discovered facts and sect manuals, boosting `CULT.rate`, `matk`, and `acc`.
  4. `FORTUNE_GAMBLER`: Autonomously selects `stakeTier` (`CONSERVATIVE`/`BOLD`/`ALL_IN`) from `HC.eff` and resolves deterministic risk/reward `resolveStakeWager` jackpots vs `stakeDebt`.
  5. `SPIRIT_HUSBANDRY`: Scales `bloomStacks` (`1–5`) from `W.season` and `herbalism` skill for `hp`, `mdef`, and herbal yield bonuses.
  6. `ARENA_GLORY`: Tracks `arenaStreak` and nearby spectators (`crowdRoar` `0–5`) for `atk`, `crit`, and `RENOWN_FLAME` gauge acceleration.
- Added `UI.formatTacticalSixPathSummary(W, n)` in `js/ui.js` (zero-RNG, zero-mutation).

## 4. Verification Results
- `node test/tactical_sixpaths_v330_suite.js`: `PASS`.
- `node test/equipment_v320_suite.js`: `PASS`.
- `node test/core_lock.js`: `PASS` (`155:2f9c9dd7`).
- `node tools/validate_data_schema.js`: `0 errors, 0 warnings`.
- `node tools/run_parallel_tests.js`: `187/187 PASS`, `0 FAIL`, `0 TIMEOUT`, `268 syntaxFiles` (`304.12s`).
- `node tools/build_single.js`: Built `GAME_SOURCE/JianghuSect_single.html` (`19,153 KB`).
