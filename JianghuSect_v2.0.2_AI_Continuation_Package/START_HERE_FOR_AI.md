# START HERE FOR AI — JianghuSect Continuation Package (Post-v2.0.4 -> v2.0.5)

## Quick Orientation
1. **Completed in v2.0.4**:
   - **Pillar A**: 114 new learnable weapon/hybrid/agnostic techniques + 5 non-elemental mantras across T1–T7 and all 4 quadrants of `(Weapon Requirement) × (Elemental Profile)`, plus expanded `SECT.ARCHETYPES`.
   - **Pillar B**: 12 new subpaths (50 total in `CULT.subList`), 38 new Innate Subpath Techniques, 36 new Synergies, and 12 new 9-realm tracks (`CULT.TRACKS`), achieving 100% 7-layer parity across all 50 subpaths.
   - **Pillar C**: 196 new equipment items & 196 new crafting recipes across all 14 `gearType`s and T1–T7 (both Elemental and `EXPLICIT_NON_ELEMENTAL`).
   - See `PATCH_IMPLEMENTATION_REPORT.md` for full tables and verification metrics.
2. **Next Task (v2.0.5)**:
   - Read `MASTER_IMPLEMENTATION_PROMPT_EN.md` for the complete specification of Patch v2.0.5 (Equipment Resonance Sets, Tactical Counter-Weapon Combat AI, and Grand Sect Martial Assembly Overhaul).
3. **Key Commands**:
   - Build single-file HTML: `cd GAME_SOURCE && node tools/build_single.js`
   - Run new expansion suite: `cd GAME_SOURCE && node test/weapon_subpath_gear_expansion_suite.js`
   - Run all tests in parallel: `cd GAME_SOURCE && node tools/run_parallel_tests.js`
