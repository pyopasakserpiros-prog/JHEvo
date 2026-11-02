# Jianghu Evolution (JHEvo) — Subsequent Patch Prompt (v2.0.10)

## 1. System Role & Engineering Mandate
You are the lead systems architect, engine optimization specialist, and Xianxia computational game designer taking over the development of **JianghuSect Evolution (JHEvo)** from the verified **Patch v2.0.9** baseline (`GAME_SOURCE/` and `GAME_SOURCE/JianghuSect_single.html`).

### Verified v2.0.9 Baseline Architecture:
1. **9 Major Cultivation Paths (All fully equivalent)**:
   - `XIAN` (9 stages, 12 subpaths)
   - `BODY` (5 stages, 10 subpaths)
   - `GOD` (4 stages, 9 subpaths)
   - `DEMON` (9 stages, 10 subpaths)
   - `HEART_SOUL` (9 stages, 9 subpaths)
   - `MECH_PUPPET` (8 stages, 7 subpaths) — Construct readiness, puppet overdrive, soul vessel decoy
   - `KARMA_SAMSARA` (8 stages, 7 subpaths) — Causal debt ledger, Six-Realm Wheel stances, echo saves
   - `BEAST_SOVEREIGN` (8 stages, 7 subpaths) — Pack sovereign command, multi-pet capacity (2–4 active pack slots)
   - `SAGE_SUPPORT` (8 stages, 7 subpaths) — Acupoint saint, celestial zither, nectar apothecary, talisman patron
2. **14 Starting Sect Archetypes in `SECT.ARCHETYPES` & `SECT.ARCHETYPE_WEAPON`**:
   - Allows starting a sect from Day 1 aligned with ANY of the 9 major cultivation paths.
3. **Universal Spirit Beast Breeding & Bloodline Awakening (`CULT.breedBeasts`, `CULT.awakenBloodline`, `CULT.menagerieTick`)**:
   - Dual-parent genetic blending across species, tiers (awaken chance +1 tier up to T7), bloodline traits, and reserve menagerie resting.
4. **Formation & Ensemble Support Aura System (`COMBAT.evaluateFormationSynergy`)**:
   - Multi-path party synergies (Iron Vanguard, Harmonic Ensemble, Construct Bastion, Karmic Aegis, Dao-Mind Resonance, Beast Pack Rush) active in Ancient Sanctums (`EX.resolveSanctum`) and Sect Raid Defenses.
5. **Support & Medical Triage Doctrine (`SECT.ensureSupportDoctrine`, `SECT.setSupportDoctrine`)**:
   - Autonomous triage prioritization (`ELDER_FIRST`, `SEVEREST_FIRST`, `VANGUARD_FIRST`, `BALANCED`) in `AI.findSupportBlessTarget`.
6. **3 Specialist Sect Facilities (`SECT.ensureSpecialistFacilities`)**:
   - `mech_workshop`, `beast_menagerie`, `harmonic_pavilion` with upgrading authority and Edit Hub controls.
7. **Complete 82-Suite Automated Test Harness (`test/run_all.js`, 82/82 PASS)**.

---

## 2. Invariant Constraints & Guardrails
1. **Immutable `human_core.js`**:
   - `GAME_SOURCE/js/human_core.js` MUST NOT BE MODIFIED (`SHA-256: a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`, `HC.FINGERPRINT === '155:2f9c9dd7'`).
2. **40 `<script>` Tag Load Invariant**:
   - Keep the exact 40 `<script>` tags in `GAME_SOURCE/index.html` and `GAME_SOURCE/test/load.js`. Never inject new external script tags; extend existing modules.
3. **Deterministic Simulation & Performance Budget**:
   - Headless Chromium 80-NPC benchmark in `test/browser_mobile_perf.js` must execute strictly `< 3.0 ms/tick` (sustaining > 330 ticks/s).
4. **Universal 9-Path Equity (No Single-Path Exclusivity)**:
   - Any new dungeons, trials, world encounters, or systems MUST be universal and open to all 9 cultivation paths using calibrated `Stage Equivalence` (`CULT.equivalentStage` / `CULT.effectiveTechStage`). Do NOT create content restricted to only a subset of paths.

---

## 3. High-Priority Engineering Pillars for Patch v2.0.10

### Pillar A: Universal Nine-Dao Trial Pagoda & Five-Elemental Secret Realms
*Reference Specification from `FUTURE_ROADMAP_AND_IDEAS.md` Section 2:*
1. **The Nine-Dao Trial Pagoda (`EX.NINE_DAO_PAGODA`) in `js/explore.js`**:
   - Implement an ancient 9-floor trial pagoda accessible to any party of cultivators.
   - Each floor represents one of the 9 Dao paths (Floor 1: Xian/Sword, Floor 2: Body/Vajra, Floor 3: God/Solar, Floor 4: Demon/Abyss, Floor 5: Heart-Soul/Void, Floor 6: Mech/Clockwork, Floor 7: Karma/Samsara, Floor 8: Beast/Sovereign, Floor 9: Sage/Harmonic).
   - Cultivators matching the floor's Dao receive Dao Resonance Insights (`CULT.gainWisdom` / comprehension boosts) and unlock unique 3-piece Resonance Set pieces.
   - Non-matching cultivators can still clear the floor through team formation synergies (`COMBAT.evaluateFormationSynergy`).
2. **Five-Elemental Secret Realms (`EX.ELEMENTAL_REALMS`)**:
   - 5 rotating elemental secret realms (Metal, Wood, Water, Fire, Earth) matching `ELEM.ELEMENTS`.
   - Environmental affinities grant combat bonuses to matching spiritual roots (`ELEM.root`) and drop primordial elemental refining catalysts (`g.ECO.REFINEMENT_CATALYSTS`).

### Pillar B: War-Beast Deployment & Sect Mount Expeditions
*Reference Specification from `FUTURE_ROADMAP_AND_IDEAS.md` Section 3:*
1. **Sect Defense War-Beasts**:
   - Allow disciples or the Sect Master to assign reserve beasts from `W.sect.beasts` as Gate Vanguard defenders (`W.sect.gateBeasts`).
   - In `EXPED.spawnRaid` and `X.rally`: Gate Vanguard beasts enter combat alongside guards, absorbing enemy assault charges and using their bloodline traits (`ALPHA_FANG`, `IRON_CARAPACE`, `VENOM_GLAND`, `SOVEREIGN_AWAKENED`).
2. **Spirit Mount Caravan System**:
   - In `EXPED.createParty`: if any party member owns a beast with role `MOUNT_CHARGER` or family `AVIAN` / `UNGULATE`, the expedition travel duration is reduced by 25% and loot capacity is increased by 40%.

### Pillar C: All-Jianghu Grand Martial Conference & Tributary Treaties
*Reference Specification from `FUTURE_ROADMAP_AND_IDEAS.md` Section 4:*
1. **Quadrennial Jianghu Martial Assembly (`SECT.WORLD_MARTIAL_CONFERENCE`)**:
   - Every 3 game years (Day 1080, 2160...), trigger an all-sect tournament inviting champions from all rival and allied sects in `W.world.sects`.
   - Multi-bracket elimination incorporating tactical relations, resonance sets, and formation synergies.
   - Victorious sect gains continental prestige, massive fame, and imperial decree rewards.
2. **Vassal & Tributary Treaties (`VASSAL_TREATY` in `js/content.js`)**:
   - Defeating rival sects in major disputes enables forcing a `VASSAL_TREATY`, yielding seasonal spirit stone tribute and rare herb imports.

---

## 4. Required Deliverables for Patch v2.0.10
1. Updated source code in `GAME_SOURCE/` maintaining all performance and invariant locks.
2. Rebuilt single-file bundle `GAME_SOURCE/JianghuSect_single.html` via `node tools/build_single.js`.
3. Comprehensive test suite `test/v210_pagoda_warbeasts_conference_suite.js` registered in `test/run_all.js`.
4. Verification of 100% test pass rate across all suites.
5. Complete release ZIP package and comprehensive implementation report.
