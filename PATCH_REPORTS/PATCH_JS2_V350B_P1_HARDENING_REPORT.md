# Patch Report — JianghuSect 2 (`JS2-v3.5.0b`: Phase B P1 Live-Loop Wiring, Consolidation & UI Sync)

- **Version**: `SIM.PATCH_VERSION = '3.5.0b'`
- **Save Schema**: `SIM.SAVE_SCHEMA_VERSION = '3.5.0b-p1-hardening'` (100% backward-compatible with `3.5.0a-p0-hardening`, `3.4.0-world-events`, `3.3.0-tactical-sixpaths`, `3.2.0-equipment-expansion`, `3.1.0-living-lore`, `3.0.0-living-continent`, and legacy schemas)
- **Protected Locks Verified**:
  - `AGENTS.md`: SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4` (byte-identical)
  - `GAME_SOURCE/js/human_core.js`: `HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (byte-identical)
  - Exact 40 `<script>` tags preserved across `index.html`, `test/load.js`, and `JianghuSect_single.html`

## Phase B P1 Fixes Implemented Across All 4 Groups
- **Group 1 (`cultivation.js`, `bottleneck.js`, `ai.js`, `cognition.js`, `knowledge.js`)**:
  - **G1-05**: Consolidated 3 vow systems (`OATH_CATALOG`, `VOLUNTARY_VOWS`, `MARTIAL_VOWS`) to cap combined `CULT.rate` bonus, wired `CULT.MARTIAL_VOWS.recordBreach(W, npc, 'PILL_IN_COMBAT')` into `ECO.usePill`, updated `isAbstainingFromPills`/`isBoundNoRetreat` for `npc.voluntaryVow`, and restored `CULT.VOLUNTARY_VOWS.getStatBonuses` in `stats.js`.
  - **G1-06**: Fixed all 6 `SIX_PATH_MASTERY` defects (`W.graveyard`/`.family`, `W.sect.library` + `discovered`-only facts for `LORE_ARCHIVIST`, numeric `W.season`, `survival`/`fishing`, `yieldBonusPct` wired into `ECO.harvestHerb`, and `recordArenaVictory`/`resolveStakeWager` wired into `C.recordLifeConclude`).
  - **G1-07..12**: Wired `BN.resolveBreakthroughPillKey`, aligned `GRAND_DAO_BT_LINEAGE` with all real `CULT.PATHS`, guarded empty `cands`/`n.inv.mats`/`n.inv.crystals`/`experienceEventLog.counts`, and cleared dangling dead `W.sect.masterId` on extinction.
- **Group 2 (`combat.js`, `stats.js`, `martial.js`, `economy.js`)**:
  - **G2-P1-1/2/3**: Wired `C.evaluateRowTacticalBonus` into `C.applyDamage`, wired `C.SOVEREIGN_KEYWORDS_CATALOG` into `C.keywordsOf`, prioritized `DUET_PAIRED_RELIC_HARMONY` with `gearUsable` check, and updated `ECO.evaluatePairedItems` to check `pairedSetId || pairId`.
  - **G2-P1-4/5/6**: Fixed `ST.get`/`passiveCacheKey` (`heartDemon`, full vow ID hash, `demonicRealmsGauge`, `archetypeMasteryState`, `secRes.id`, `ST.gearStateSig`), fixed `GS_CACHE` (`ST.gearStateSig` for dormant/wear, stopped double-counting `combatMult`/`defMult`, added `s.move`), and guarded non-lethal spars from burning permanent/limited cheat-death saves.
- **Group 3 (`economy.js`, `external_market.js`, `sect.js`, `combat.js`, `sim.js`)**:
  - **G3-P1-4/5/6/7/8**: Wired `ECO.recordGearLineage` (daily echo sync), `ECO.recordGearDeed('kill')` on combat kills, decremented `it.charges` on combat proc activation, fixed `FREE_TRADE_TREATY` to read `W.world.politics.treaties`, unlocked 4 `BEAST_TAMING` recipes in `ECO.pickOrder`, stocked `EQ_V320_*` gear in `external_market.js`, closed `payOfficeStipends(forceFull)` stone-conjuring, scoped `isElder` in `SECT.appoint`, and filtered dead/away challengers in `tickInternalPolitics`.
- **Group 4 (`sim.js`, `main.js`, `ui.js`)**:
  - **G4-F02/03/04/05**: Fixed `SIM.hourly` minutes-vs-hours modulo bug (`Math.floor(W.t / 60) % 12/24/72`), clamped `dt` to `0.25s` in `main.js`, added `castFx` to `SIM.TRANSIENT_CACHE_KEYS`, wired `UI.formatTacticalSixPathSummary` into `UI.rNpc` and `UI.formatExternalWorldEventsSummary` into `UI.rWorld`, localized `gearEffectSummaryTh`, and updated the About version string.

## Verification
- `node GAME_SOURCE/test/core_lock.js` — PASS
- `node GAME_SOURCE/tools/validate_data_schema.js` — PASS (`Errors: 0, Warnings: 0`)
- `node GAME_SOURCE/test/p1_hardening_v350b_suite.js` — PASS
- `node GAME_SOURCE/test/p0_hardening_v350a_suite.js` — PASS
- `node GAME_SOURCE/test/world_events_v340_suite.js` — PASS
- `node GAME_SOURCE/test/tactical_sixpaths_v330_suite.js` — PASS
- `node GAME_SOURCE/test/equipment_v320_suite.js` — PASS
- `node GAME_SOURCE/tools/build_single.js` — `JianghuSect_single.html` rebuilt
- `node GAME_SOURCE/tools/run_parallel_tests.js` — `187/187 PASS`
