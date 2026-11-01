# Patch Implementation Report — v2.0.7: Edit Hub Diplomacy & Sanctum Controls, 50-Subpath Progression Bridge, and Cross-Sect Assembly

## 1. Executive Summary

This release (v2.0.7) implements all objectives outlined in `SUBSEQUENT_PATCH_PROMPT_V2_0_7_EN.md` tailored specifically to the user's design requirement:
> *"ไม่ทำuiให้ผู้เล่นควบคุม แต่เอาไปทำเป็น edit ใน edit hubแทน ทำให้ใช้งานง่าย นอกนั้นทำเหมือนในพรอมบอกตามแผนที่วางไว้เลย ลุย"*
> (Do not clutter regular gameplay screens with manual player-control buttons; instead, integrate Diplomacy, Sanctum Boss Clears, and Catalyst Refinement directly into the **Edit Hub** (`UI.rEdit` / `edit` sheet) for maximum ease-of-use and flexibility, while implementing the 50-Subpath Progression Bridge and Cross-Sect Tournament Assembly.)

### Key Deliverables:
1. **Area 1 — Edit Hub Management for Diplomacy, Sanctums & Refinement**:
   - Integrated two dedicated tabs (`dip` for Diplomacy/World Politics and `sanctum` for Ancient Sanctums & Refinement) into the Edit Hub (`UI.rEdit`, `UI.open('edit')`, and `$('sheet').onclick`).
   - Implemented `SECT.EDITOR.diplomacyState(W, sectId)` and `SECT.EDITOR.applyDiplomacyAction(W, opts)`:
     - `set_attitude`: Clamp attitude between -100 and 100.
     - `sign_treaty` / `clear_treaty`: Sign or dissolve any treaty (`ALLIANCE`, `TRADE_CARAVAN_ACCORD`, `MARTIAL_EXCHANGE`, `NON_AGGRESSION`, `RIVAL_FEUD`) directly.
     - `reset_cooldowns`: Instantly clear caravan, treaty, and envoy cooldowns.
     - `ally_exchange`: Send instant allied caravan exchange (grants specialty subpath crystals, recipes, and materials).
     - `trigger_envoy`: Dispatch rival envoys to challenge the sect (with normal combat power simulation or `forceWin` / `forceLoss` controls for instant testing).
     - `spawn_political_event` / `resolve_political_event`: Trigger and resolve geopolitical events (`SPECIALTY_CARAVAN`, `TRIBUTE_DEMAND`, `DOCTRINE_SUMMIT`, `BORDER_HERB_DISPUTE`).
   - Implemented `SECT.EDITOR.sanctumState(W, sanctumId)` and `SECT.EDITOR.applySanctumAction(W, opts)`:
     - View sanctum floor guardians, guaranteed catalysts, bonus drop statistics, and recent run history.
     - `set_cleared`: Set the deepest cleared floor (0..3) directly.
     - `instant_run`: Simulate a full sanctum expedition with 1-click (`forceClear` for guaranteed 3-floor clear + catalyst awards + bonus-reward roll, or realistic combat simulation with tactical retreat on low HP).
     - `spawn_catalysts`: Add refinement catalysts (+5 each of `CAT_RESONANCE_JADE_4`, `CAT_ASTRAL_ESSENCE_5`, `CAT_PRIMORDIAL_FLAME_6`) directly to the sect armory.
     - `refine_gear`: 1-click catalyst refinement for T4–T6 equipment on both sect inventory and NPC-equipped gear.
   - Enhanced character editing in `UI.rEdit` ('char' tab) and `SECT.EDITOR.applyCharacterEdit` to view and directly set `cult.trackOrdinal` (1–9 or 0 to close).

2. **Area 2 — Full 50-Subpath Specialization Track Progression Bridge**:
   - Expanded specialization tracks to cover all 50 subpaths across the 5 major cultivation paths:
     - 23 expansion subpaths remain in `CULT.TRACKS` / `CULT.EXPANSION_TRACK_IDS`.
     - 27 base subpaths are mapped in `CULT.ADVANCED_TRACKS` with full 9-realm progression, authentic Thai realm names, skill gates, spirit stone costs, realm buffs, and capacity multipliers.
   - Preserved `test/martial_retraining.js:13` regression invariant by ensuring `M.retrain` only auto-initializes tracks upon retraining for expansion subpaths (`CULT.isExpansionTrack(k.id)`).
   - Base subpaths awaken their specialization track at `effectiveTechStage >= 4` via `CULT.ensureTrack(n, day)`, via explicit awakening with `CULT.awakenSpecializationTrack(n, day)`, or via Edit Hub `applyCharacterEdit({ cult: { trackOrdinal: ... } })`.
   - Unified `CULT.trackDef` to seamlessly resolve definitions across all 50 subpaths so that `CULT.checkTrackGates`, `CULT.trackBreakthrough`, `CULT.inspectProgressionBottleneck`, and `M.activeBottleneckSkills` operate universally for every disciple.

3. **Area 3 — Cross-Sect Invited Martial Assembly & Envoy Duel Visuals**:
   - Extended `SECT.assembly` in `js/sect.js` so allied sects (`ALLIANCE`, `ALLIANCE_PACT`, `MARTIAL_EXCHANGE` or high attitude >= 40) send guest prodigies into Junior, Core, and Elder tournament brackets.
   - Handled combat power simulation and tactical weapon readiness cleanly for both disciple and guest entrants (`SECT.simulateAssemblyBout`).
   - Guest prodigies participate in bouts, taking stone prizes if they win without consuming disciple CP allocations or tailored sect equipment.
   - Recorded allied guest participation, guest bout match logs, and rival envoy challenge duels in `W.sect.assemblyHistory`.

4. **Hard Invariants Verified**:
   - `GAME_SOURCE/js/human_core.js` fingerprint preserved: `155:2f9c9dd7` (`test/core_lock.js` PASS).
   - 40 scripts maintained in `GAME_SOURCE/index.html` and `GAME_SOURCE/test/load.js`.
   - Mobile performance budget satisfied: `2.572 ms/tick` (under the `< 3.0ms` limit) in `test/browser_mobile_perf.js`.
   - Rebuilt standalone `JianghuSect_single.html` via `node tools/build_single.js` and verified with `test/standalone.js`.
   - Created comprehensive new test suite `test/edithub_crosssect_progression_suite.js` (ALL 5 AREAS PASS).
   - Registered in `test/run_all.js` and verified 100% test pass rate.

---

## 2. Test Verification Matrix

| Test Suite | Focus Area | Status |
| :--- | :--- | :--- |
| `test/edithub_crosssect_progression_suite.js` | Edit Hub Diplomacy, Sanctums, 50-Subpath Progression & Cross-Sect Assembly | **PASS** |
| `test/core_lock.js` | Human Core fingerprint preservation (`155:2f9c9dd7`) | **PASS** |
| `test/specialization_tracks.js` | 9-Realm specialization tracks, dual progression & gates | **PASS** |
| `test/martial_retraining.js` | Retraining safety & base subpath unawakened invariant | **PASS** |
| `test/diplomacy_sanctum_ancestral_suite.js` | Diplomacy lifecycle, Sanctum bonus rolls & Ancestral shrines | **PASS** |
| `test/phase2_edit_hub_inventory.js` | Character editor, item spawner & Edit Hub bag actions | **PASS** |
| `test/standalone.js` | Standalone bundle: 40 inline scripts, no external runtimes, 24h simulation | **PASS** |
| `test/browser_mobile_perf.js` | Mobile performance budget (80 NPCs, 2.572 ms/tick < 3.0ms) | **PASS** |
