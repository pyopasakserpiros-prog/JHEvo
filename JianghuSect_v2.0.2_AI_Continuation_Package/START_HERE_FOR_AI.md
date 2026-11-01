# START HERE FOR AI — JianghuSect Continuation Package (Post-v2.0.5 -> v2.0.6)

## Quick Orientation
1. **Completed in v2.0.5**:
   - **Pillar A**: 14 3-Piece Equipment Resonance Sets (`MARTIAL.RESONANCE_SETS`) across `WEAPON + ARMOR + ACCESSORY` (T3–T7) covering all 50 subpaths, with 2-piece partial and 3-piece full resonance bonuses + combat riders, wired into `STATS.compute`, `STATS.explain`, `MARTIAL.gearSuitability`, and `COG.bestGearUpgrade`.
   - **Pillar B**: Tactical Combat Stance & Counter-Weapon AI (`SK.WEAPON_TACTICS`, `COMBAT.resolveWeaponTactics`, `COMBAT.explainTactics`) implementing polearm first-strike vs lightness gap-closers, ranged kiting vs dash/leap counters, and heavy weapon guard-shatter against shields (`DEFENSIVE_TECHNIQUE`).
   - **Pillar C**: Grand Sect Martial Assembly & Peak Trial Arena (`SECT.assembly`, `SECT.ASSEMBLY_BRACKETS`) with Junior (T1–T2), Core (T3–T4), and Elder/Peak (T5–T7) divisions, awarding CP, tailored T3–T6 craftable equipment & recipes, and sect prestige, recorded in `W.sect.assemblyHistory` and shown in the Sect Overview UI.
   - See `PATCH_IMPLEMENTATION_REPORT.md` for full verification metrics (77/77 passing test suites).
2. **Next Task (v2.0.6)**:
   - Read `MASTER_IMPLEMENTATION_PROMPT_EN.md` for the complete specification of Patch v2.0.6 (Inter-Sect Grand Alliance & Rivalry Diplomacy, Expedition Relic Resonance Dungeons, and Ancestral Shrine Legacy Blessings).
3. **Key Commands**:
   - Build single-file HTML: `cd GAME_SOURCE && node tools/build_single.js`
   - Run v2.0.5 suite: `cd GAME_SOURCE && node test/resonance_tactics_assembly_suite.js`
   - Run all tests in parallel: `cd GAME_SOURCE && node tools/run_parallel_tests.js`
