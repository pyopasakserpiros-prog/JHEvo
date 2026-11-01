# START HERE FOR AI — JianghuSect Continuation Package (Post-v2.0.6)

## Quick Orientation
1. **Completed in v2.0.6**:
   - **Pillar A**: Inter-Sect Grand Alliance, Trade Pacts & Martial Rivalry Envoys (`CONTENT.SECT_TREATIES`, `CONTENT.negotiateTreaty`, `CONTENT.dispatchDiplomaticCaravan`, `CONTENT.selectRivalEnvoys`, and rival envoy entry in `SECT.assembly`).
   - **Pillar B**: Multi-Floor Ancient Relic Sanctums (`EXPLORE.SANCTUM_FLOORS`, `EXPLORE.delveRelicSanctum`) with Floor 3 3-piece resonance guardians and Catalyst Gear Refinement (`ECON.refineGearWithCatalyst`).
   - **Pillar C**: Ancestral Shrine Legacy Tablets & Fallen Elder Blessings (`SECT.enshrineAncestralTablet`, `SECT.prayAtAncestralShrine`, `SECT.activeAncestralBlessing`, `AI.ACTS.ancestralPray`) wired into `CULT.die`, `CULT.checkAscension`, and `CULT.attemptBreakthrough`.
   - **Pillar D**: Rational Technique Access, Weapon Compatibility & 5-Path Equivalent-Stage Progression (`CULT.checkTechniqueCompatibility`, `CULT.equivalentTier`, universal legendaries & cross-path adaptation across all 630 techniques).
   - **Pillar E**: Autonomous Bottleneck Resolution for NPC Cultivation & Specialization Progression (`CULT.inspectProgressionBottleneck`, `CULT.evaluateBottleneckActionFeasibility`, `PROF.missingBottleneckSkill`, `MARTIAL.pickSkillPractice`, `COG.score`, and truthful UI explanations in `COG.explain` & `UI.rNpc`).
   - See `PATCH_IMPLEMENTATION_REPORT.md` for the original claims; see REVIEW_FOLLOWUP.md for verified scope and follow-up results.
2. **Key Commands**:
   - Build single-file HTML: `cd GAME_SOURCE && node tools/build_single.js`
   - Run v2.0.6 selected smoke checks: `cd GAME_SOURCE && node test/diplomacy_sanctum_ancestral_suite.js`
   - Run all 79 test suites in parallel: `cd GAME_SOURCE && node tools/run_parallel_tests.js`
