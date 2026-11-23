# Patch Report — JianghuSect 2 (`JS2-v3.5.0a`: Phase A P0 Hardening & Critical Pipeline Restoration)

- **Version**: `SIM.PATCH_VERSION = '3.5.0a'`
- **Save Schema**: `SIM.SAVE_SCHEMA_VERSION = '3.5.0a-p0-hardening'` (100% backward-compatible with `3.4.0-world-events`, `3.3.0-tactical-sixpaths`, `3.2.0-equipment-expansion`, `3.1.0-living-lore`, `3.0.0-living-continent`, and legacy schemas)
- **Protected Locks Verified**:
  - `AGENTS.md`: SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4` (byte-identical)
  - `GAME_SOURCE/js/human_core.js`: `HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (byte-identical)
  - Exact 40 `<script>` tags preserved across `index.html`, `test/load.js`, and `JianghuSect_single.html`

## All 13 P0 Fixes Implemented
1. **G1-01 (`js/retraining.js`)**: Guarded `n.inv`, `n.inv.crystals`, `n.inv.techs`, and `W.sect.library` in `M.retrain` and `M.evaluateRetraining`.
2. **G1-02 (`js/bottleneck.js`)**: Chained `origStart` in `AI.ACTS.breakthrough.start` after `BN.prepare(W, n)` so `CULT.TRIBULATION.start()` activates on normal NPC breakthroughs.
3. **G1-03 (`js/ai.js`)**: Guarded `n.inv` and `n.equip` in `AI.kill` so death cleanup (`W.sect.fallen`, legacy tablets, crown vacation, posthumous titles) always completes.
4. **G1-04 (`js/cultivation.js`)**: Added `maxStage` guard in `CULT.breakthrough` to prevent `c.stage` overflowing `stages.length`.
5. **G2-P0-1 (`js/combat.js`)**: Normalized `{ kw, params }` and `C.EQUIPMENT_KEYWORDS_CATALOG` in `C.keywordsOf` so all 113 v3.2.0 equipment `combatKeywords` and 8 equipment keywords are active (while keeping `C.KEYWORDS_CATALOG` locked at 16 keys).
6. **G2-P0-2 (`js/combat.js`)**: Wired offensive `EFX_V320_*` handlers (`CHARGE_RELEASE STRIKE`, `PACT_OVERDRIVE`, `CURSED_SIPHON`, `PAIRED_LINK`, `DEED_AWAKEN`, `LINEAGE_ECHO`, `TEMPERAMENT_SYNC`) into the `onHit` branch, honored `drawbackHpDrainPct`, and restored reachable `recordGearDeed('bossHit')`.
7. **G2-P0-3 (`js/skills.js`)**: Fixed `SK.list(n)` to read `n.archetypeMasteryState` / `n.subpathArchetype` + tier and call `SK.getArchetypeSignatureSkills(archId, archTier)` (with cache key invalidation), restoring `ARCH_*_T4` and `ARCH_*_T6_FINISHER`.
8. **G2-P0-4 (`js/stats.js`, `js/visitors_clues.js`)**: Added dynamic `ST.gearStateSig(it)` cache invalidation and pre-authored `baseSt` preservation so Patina, Deeds, Lineage, and Dormant update immediately on state change.
9. **G2-P0-5 (`js/combat.js`)**: Added unified `C.applyProcDamage` routing direct proc damage (`EXECUTE_REAPER`, `CHARGE_RELEASE`, `gainSecondaryResource`, `checkToxinSynergy`, `tickBattlefieldDaoScars`, `tryTranscendentCutIn`, `processTranscendentAccessoryCast`, `processTranscendentWeaponStrike`) through `C.applyDamage` so shields, `yieldThreshold`, `WILD.landHitLimit`, and `landContributions` are enforced.
10. **G3-P0-1 (`js/expedition.js`)**: Fixed `EXTERNAL_WORLD_EVENTS.tickDaily` to filter available/idle/non-away NPCs, score by preferred path & anti-repeat rotation using `detHash340` (zero `W.rng`), apply fatigue cost, and emit visible chronicle/world logs.
11. **G3-P0-2 (`js/expedition.js`)**: Replaced phantom `W.world.stonePool` with canonical closed-loop `W.world.resourcePool.stones` (never conjuring stones from an empty/missing pool).
12. **G3-P0-3 (`js/expedition.js`)**: Wrote event lore discoveries to canonical `W.world.livingLore.facts[id]` (keeping `discoveredFacts` synced), fixed events #29–#40 `loreFactIdx` thematic mapping, and fixed the 2 missing `relicLinkId` entries (`EXT_EVT_20` → `EQ_V320_CURSED_ROBE_T5`, `EXT_EVT_35` → `EQ_V320_TEMP_SWORD_T4`).
13. **G4-F01 (`js/sim.js`)**: Changed Living Epithets daily wrapper from nonexistent `SIM.daily` to `SIM.dailyUpdate`.

## Verification
- `node GAME_SOURCE/test/core_lock.js` — PASS
- `node GAME_SOURCE/tools/validate_data_schema.js` — PASS (`Errors: 0, Warnings: 0`)
- `node GAME_SOURCE/test/p0_hardening_v350a_suite.js` — PASS (all 13 P0 checks)
- `node GAME_SOURCE/test/world_events_v340_suite.js` — PASS
- `node GAME_SOURCE/test/tactical_sixpaths_v330_suite.js` — PASS
- `node GAME_SOURCE/test/equipment_v320_suite.js` — PASS
- `node GAME_SOURCE/tools/build_single.js` — `JianghuSect_single.html` (`19,185 KB`)
- `node GAME_SOURCE/tools/run_parallel_tests.js` — `187/187 PASS`
