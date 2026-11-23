# Patch Report — JS2 v3.7.0a (Phase A: All 9 P0 Critical Audit Fixes)

**Release Date**: 2026-11-19  
**Patch Version**: `3.7.0a`  
**Save Schema**: `3.7.0a-p0-audit-fixes` (backward-compatible with `3.7.0-legendary-dao` and all prior schemas)

## Summary of All 9 P0 Fixes Resolved
1. **Live Combat Wiring for `COMBAT.runLegendaryDaoProc` (`GAME_SOURCE/js/combat.js`)**: Wired into `C.useSkill` (`cast`) and `C.hit`/`C.strike` (`hit` & `struck`), fixed all 5 stacked API/schema bugs (6-arg `C.applyProcDamage`, `ST.applyNamedBuff`, `ST.addStatus`, `ST.has`, real `u.h.state.hp`/`qi`), added floating `.fx` combat cues, and implemented the 2 missing paths (`LEG_JADE_CARAVAN_VOYAGER` / `KW_DAO_PROVISION_SHARE` & `LEG_OATH_JUDGE_WARDEN` / `KW_DAO_VERDICT_MARK`).
2. **Stage 4–9 Composable Proc One-Shot Cap (`GAME_SOURCE/js/combat.js`)**: Scaled composable action procs (`CHAOS_ELEMENT_SHATTER`, `IAI_ZERO_QI_SLASH`, etc.) by `C.stageRefHp(t)` (`<= 0.22 * stageRefHp`) and removed direct `C.setHp` defense/shield bypasses so Stage 7+ fights no longer end in Tick-1 one-shots.
3. **`CULT.LEGENDARY_DAO.evaluateNpcAdoption` Full State Cleanup (`GAME_SOURCE/js/cultivation.js`)**: Clears legacy `track`, `prog`, `mechState`, `karmaState`, `pathGauge`, `demonicRealmsGauge`, `grandDaoState`; reconciles `bestMantra`, `reconcileInnate`, `reconcilePassives`, incompatible gear, lifespan, and `STATS.dirty`; uses real `npc.h.name.given` in logs.
4. **`BN.resolveBreakthroughPillKey` Transitive Resolution (`GAME_SOURCE/js/bottleneck.js`)**: Follows `GRAND_DAO_BT_LINEAGE` transitively up to 4 hops with `P:BT_XIAN_*` fallback, fixing all 67 broken path×stage breakthrough pill pairs (385/385 valid across 55 paths × 7 stages).
5. **`UI.rWorld` Latent `ReferenceError` Fix (`GAME_SOURCE/js/ui.js`)**: Fixed `h +=` → `outHtml +=` on `world-legendary-dao-card` with duplicate guard and safe `CULT` lookup in `UI.formatLegendaryDaoSummary`.
6. **`render.js` 12 Distinct Crowns, 12 Motes & 8 Valid `sceneByPath` Families (`GAME_SOURCE/js/render.js`)**: Added explicit drawing cases for all 12 Legendary/Transcendent paths in `drawPathApexCrownGeometry` and `drawSinglePathMoteShape`, and mapped all 8 unmapped `sceneByPath` entries to valid `drawLegendaryApparition` families.
7. **`FACT_V370_01..12` Living Lore Schema Fix (`GAME_SOURCE/js/expedition.js`)**: Replaced deprecated `textTh` with `summaryTh` and added `biasTh` across all 48 accounts.
8. **Rarity Gating Hardened (`retraining.js`, `expedition.js`, `sect.js`)**: Blocked crystal retraining, monthly merchant caravans, and Grand Dao debates from bypassing `CULT.LEGENDARY_DAO` discovery and `minEqStage` gates.
9. **`RES_V320_*` Slots Schema & `PATH_DESCRIPTORS.cult.s2` (`data_expansion.js`, `martial.js`, `cultivation.js`)**: Converted all 3 `RES_V320_*` sets to `gearType` arrays, fixed `EQ_V320_SET_ARCH_SHOES` slot collision (`ACCESSORY` → `ARMOR`), guarded `Array.isArray(allowedTypes)`, and fixed `s2: 'LEADERSHIP'` → `'administration'`.

## Verification Summary
- `p0_audit_v370a_suite.js`: **9/9 PASS**
- `legendary_dao_v370_suite.js`: **7/7 PASS**
- `living_lore_v310_suite.js`, `equipment_v320_suite.js`, `living_world_audit_v360c_suite.js`, `full_release_audit_and_behavior_suite.js`: **ALL PASS**
- `core_lock.js` & `validate_data_schema.js`: **PASS** (`Errors: 0, Warnings: 0`)
- `JianghuSect_single.html` rebuilt & `AGENTS.md` / `human_core.js` SHA-256 locks verified untouched.
