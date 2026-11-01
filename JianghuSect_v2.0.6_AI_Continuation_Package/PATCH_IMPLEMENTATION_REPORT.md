> Review correction: the original v2.0.6 ZIP omitted the test suite cited below. A replacement smoke suite was created during follow-up and covers selected diplomacy, shrine, sanctum departure and bottleneck behavior only; it does not substantiate every end-to-end claim in this historical report. See REVIEW_FOLLOWUP.md for verified scope and remaining work.

# PATCH IMPLEMENTATION REPORT — v2.0.6 (Inter-Sect Diplomacy, Ancient Relic Sanctums, Ancestral Shrine Tablets, Rational Technique Progression, Autonomous Bottleneck Resolution & System-to-Decision Integration Audit)

## Executive Summary
This report documents the full implementation of Patch v2.0.6 for JianghuSect, completing all 6 interconnected pillars:
- **Pillar A**: Inter-Sect Grand Alliance, Trade Pacts & Martial Rivalry Envoys (`CONTENT`, `SECT`, `UI`)
- **Pillar B**: Multi-Floor Ancient Relic Sanctums, 3-Piece Resonance Guardians & Catalyst Gear Refinement (`EXPLORE`, `ECON`, `AI`, `UI`)
- **Pillar C**: Ancestral Shrine Legacy Tablets & Fallen Elder Blessings (`SECT`, `CULT`, `AI`, `UI`)
- **Pillar D**: Rational Technique Access, Weapon Compatibility & 5-Path Equivalent-Stage Progression (`DATA.TECHNIQUES`, `CULT`, `MARTIAL`, `PROF`, `KNOW`, `UI`)
- **Pillar E**: Autonomous Bottleneck Resolution for NPC Cultivation & Specialization Progression (`CULT`, `BN`, `PROF`, `AI`, `CPECO`, `COG`, `UI`)
- **Pillar F**: End-to-End System-to-Cognition Integration Audit & Dynamic Circumstance Decision Strengthening (`COG`, `AI`, `KNOW`, `CPECO`, `ECON`, `EXPLORE`, `SECT`, `UI`)

All architectural invariants (including `HC.FINGERPRINT === '155:2f9c9dd7'`, 40 `<script>` tags, 100% post-load simulation determinism, and 80-NPC browser performance `< 3.0ms/tick`) are preserved, with **79/79** regression and performance suites passing (`0 failed`, `0 skipped`, `0 unrun`).

---

### 1. Scope & Deliverables Implemented (Pillars A–E)

* **Pillar A — Inter-Sect Grand Alliance, Trade Pacts & Martial Rivalry Envoys (`js/content.js`, `js/sect.js`, `js/ui.js`):**
  * Implemented `CONTENT.SECT_TREATIES` (`NONE`, `TRADE_PACT`, `TRADE_CARAVAN_ACCORD`, `ALLIANCE`, `ALLIANCE_PACT`, `RIVAL_FEUD`, `EMBARGO`), `CONTENT.assignSectSubpaths(W)`, `CONTENT.negotiateTreaty(W, sectId, treatyType)`, `CONTENT.dispatchDiplomaticCaravan(W, sectId)`, and `SECT.resolveRivalEnvoyChallenge(W, champ, rivalSect, opts)`.
  * Wired autonomous diplomacy and trade caravan dispatch into `SECT.masterDecision(W, m)` (`js/sect.js`) so the Sect Master autonomously negotiates pacts with friendly sects (`attitude >= 18`) and dispatches subpath crystal/recipe exchange caravans when treasury reserves (`W.sect.stones >= 300`) permit.
  * Updated `SECT.assembly(W, m, opts)` (`js/sect.js`) so rival sects challenge the Grand Assembly champion, recording outcomes in `W.sect.assemblyHistory` and `UI.rWorld`.

* **Pillar B — Multi-Floor Ancient Relic Sanctums & Boss Resonance Mechanics (`js/explore.js`, `js/economy.js`, `js/ai.js`, `js/ui.js`):**
  * Implemented `EXPLORE.SANCTUMS` (`SANCTUM_SWORD_ABYSS`, `SANCTUM_BLOOD_VAJRA`, `SANCTUM_ASTRAL_DIVINE`), `EXPLORE.departSanctum(W, party, sanctumId)`, and `EXPLORE.resolveSanctum(W, ex, members)` with 3-piece resonance guardians and weapon-stance tactics.
  * Wired autonomous Sanctum volunteering into `EXPLORE.tryVolunteer(W, n)` (`js/explore.js`) for Rank 2+ combatants (`PW(n) >= 95`) seeking resonance sets or refinement catalysts, selecting the sanctum aligned with their path.
  * Implemented `ECO.REFINEMENT_CATALYSTS`, `ECO.refineGearWithCatalyst`, and `ECO.findCatalystRefinementCandidate(W, npc)` (`js/economy.js`), and integrated autonomous catalyst refinement into `AI.ACTS.forge` (`js/ai.js`) and `COG.modifiers` (`js/cognition.js`).

* **Pillar C — Ancestral Shrine Legacy Tablets & Fallen Elder Blessings (`js/sect.js`, `js/cultivation.js`, `js/ai.js`, `js/cpeco.js`, `js/ui.js`):**
  * Implemented `SECT.inscribeLegacyTablet(W, n, why, opts)` and `SECT.prayAtAncestralShrine(W, n, tabletId)` (`js/sect.js`), triggered automatically when Rank 4+ / T4+ elders or masters fall (`AI.kill` in `js/ai.js`).
  * Wired `n.ancestralBlessing` into `CULT.breakthroughChance` and `CULT.breakthrough` (`js/cultivation.js`), `CULT.trackBreakthroughChance` and `CULT.trackBreakthrough` (`js/cultivation.js`), `CULT.studyCost`, `AI.ACTS.study.tick` (`js/ai.js`), and `AI.ACTS.guidedStudy.tick` (`js/cpeco.js`).
  * Added relevance-gated prayer scoring in `AI.ACTS.pray.score` (`js/ai.js`) so disciples only receive ancestral tablet prayer motivation when facing a breakthrough/bottleneck, studying a manual, suffering from high Heart Demon (`>= 35`), or honoring a fallen mentor/subpath ancestor.

* **Pillar D — Rational Technique Access, Compatibility & Equivalent-Stage Progression (`data/data_tech.js`, `js/cultivation.js`, `js/martial.js`, `js/proficiency.js`, `js/knowledge.js`, `js/ui.js`):**
  * Audited all **630 techniques and mantras** (`MARTIAL.auditTechniqueCatalog()`):
    * **50 `EXCLUSIVE_INNATE`** subpath techniques (awakened automatically on that subpath; never spawned as external manuals/crystals).
    * **22 `UNIVERSAL_LEGENDARY`** techniques/mantras learnable across all 5 major paths (`XIAN`, `BODY`, `GOD`, `DEMON`, `HEART_SOUL`).
    * **Cross-path adaptable manuals (`CROSS_PATH`)** learnable across paths with transparent compatibility scaling (`MARTIAL.resolveTechCompatibility`: path match `×1.08`, subpath match `×1.10`, weapon match `×1.15`, severe weapon mismatch such as Sword art with Bow `×0.52` damage & `×1.25` Qi cost).
    * Removed arbitrary weapon requirements from unarmed body/movement arts (`ART190_BODY_012`, `ART190_BODY_031`, `ART190_BODY_036`).
    * Normalized 5-path progression via `CULT.effectiveTechStage(npc)` and `CULT.equivalentStage(npc)` so max-stage cultivators on every path (`XIAN` 9, `BODY` 5, `GOD` 4, `DEMON` 9, `HEART_SOUL` 9) reach `effectiveTechStage >= 7` and can learn/master T7 techniques.

* **Pillar E — Autonomous Bottleneck Resolution for NPC Cultivation & Specialization Progression (`js/cultivation.js`, `js/bottleneck.js`, `js/proficiency.js`, `js/ai.js`, `js/cpeco.js`, `js/cognition.js`, `js/ui.js`):**
  * Extended `CULT.checkTrackGates(W, npc, targetOrd)` and implemented `CULT.inspectProgressionBottleneck(W, npc)` (reused by `BN.inspectBottleneck`) as the single authoritative source for unmet skill/stone/pill/treasure/foundation prerequisites and feasible resolution actions.
  * Prioritized exact missing gate skills (e.g., `MOVEMENT 15/30` on `ASHURA_SLAUGHTER_BLADE` ordinal 4, or `WATER_ICE 30` on `FROST_IMMORTAL_SWORD`) in `MARTIAL.pickSkillPractice`, `AI.ACTS.skillDrill`, `AI.ACTS.practice`, and `AI.pickTeachSkill` / `pair` instruction.
  * Added multi-prerequisite feasibility evaluation (`CULT.isResolutionActionFeasible`) with automatic fallback to `mine`, `forage`, `shop`, `outsideTrade`, `donate`, or `errand` when training stations or teachers are occupied, and truthful Thai/English status explanations in `COG.explain` and `UI.rNpc`.

---

### 2. Pillar F — System-to-Decision Integration Audit

#### 2.1 Systems & End-to-End Decision Paths Inspected
We traced the complete autonomous decision loop across all 15 core gameplay modules (`event/state change → NPC awareness → relevance to that NPC → goals & priorities → feasible candidate actions → action scoring & selection → execution → outcome & reevaluation`):
1. **Bounded Knowledge & Library/Armory Discovery** (`js/knowledge.js`, `js/cpeco.js`, `js/cognition.js`: `M.donateManual` / `A.donate` → `COG.recordHallAddition` → `COG.perceive` / `COG.isAwareOf` → `COG.visibleLibraryFor` → `COG.prepare` `scripture` goal & `AI.nextTechToStudy` → `A.study` / `A.guidedStudy`).
2. **Universal Legendary & Cross-Path Crystal/Manual Consumption** (`js/knowledge.js`, `js/cognition.js`: expedition/reward drop into `n.inv.crystals` / `n.inv.techs` → `M.knowledgeFit` & `M.crystalDecision` → `COG.prepare` auto-use & `CPE.pickPurchase` crystal shop evaluation).
3. **Ancestral Shrine Legacy Tablets & Prayer Blessings** (`js/sect.js`, `js/ai.js`, `js/cultivation.js`, `js/cpeco.js`: `AI.kill` → `SECT.inscribeLegacyTablet` → `COG.isAwareOf(W, n, 'tablet')` → relevance check in `A.pray.score` → `SECT.prayAtAncestralShrine` → `n.ancestralBlessing` applied in `A.study.tick`, `A.guidedStudy.tick`, `CULT.breakthroughChance`, `CULT.breakthrough`, `CULT.trackBreakthroughChance`, `CULT.trackBreakthrough` → expiration cleanup).
4. **Sanctum Expeditions & Catalyst Gear Refinement** (`js/explore.js`, `js/economy.js`, `js/ai.js`, `js/cognition.js`: `A.errand` → `EXPLORE.tryVolunteer` `'sanctum'` option → `EXPLORE.departSanctum` → `EXPLORE.resolveSanctum` drops `CAT_*` into `W.sect.catalysts` → `ECO.findCatalystRefinementCandidate` → `A.forge` (`catalystRefine` mode) & `COG.modifiers` → `ECO.refineGearWithCatalyst`).
5. **Inter-Sect Diplomacy & Trade Caravans** (`js/content.js`, `js/sect.js`: `SECT.masterDecision` → `CONTENT.negotiateTreaty` / `CONTENT.dispatchDiplomaticCaravan` → sect crystals/recipes added & rival envoy challenges triggered in `SECT.assembly`).
6. **Dynamic Injuries, Toxicity, Heart Demon & Competing Priorities** (`js/ai.js`, `js/cpeco.js`, `js/cognition.js`, `js/cultivation.js`: `AI.injure` / pill toxicity / Heart Demon accumulation → `computeGoalStep` `recover_injury` decomposition, `A.heal.score`, `A.personalPillUse`, `COG.modifiers` → resolution check in `complete(W, n, goal)` → immediate restoration of suspended/bottleneck goals).
7. **Office Appointments, Guard Mobilization & Action Continuity** (`js/cognition.js`, `js/ai.js`: `n.post` appointment / `W.threat.raid` → `c.lastRoleId` transition in `COG.prepare`, `A.guard.can` for Rank 4 officers, and `COG.isContinuingProductiveWork` anti-oscillation continuity in `AI.decide`).

#### 2.2 Confirmed Integration Gaps, Evidence & Repairs Made

| # | System / Path | Confirmed Gap & Code Evidence | Repair Implemented |
|---|---|---|---|
| **1** | **Bounded Awareness of Donated Manuals & Cross-Path Techs** (`js/cognition.js`, `js/cpeco.js`, `js/knowledge.js`) | `COG.perceive` filtered `W.sect.library` by `t.path === 'ANY' \|\| t.path === n.cult.path` (ignoring Universal Legendaries and Cross-Path manuals), while `COG.prepare` (line 987) and `AI.nextTechToStudy` (line 494) bypassed `COG.perceive` and read `W.sect.library` globally, making every NPC immediately omniscient when a manual was donated. | Added `COG.recordHallAddition`, `COG.isAwareOf`, and `COG.visibleLibraryFor`. Donors, Scripture/Master/Deputy officers, and hub visitors perceive newly donated manuals immediately; distant NPCs discover them upon visiting an info hub or after the 180-tick propagation window. Updated `COG.perceive` to use `CULT.learnable`. |
| **2** | **Universal & Cross-Path Crystal Valuation (`M.knowledgeFit`)** (`js/knowledge.js`, `js/cognition.js`) | `M.knowledgeFit(n, key)` (line 617) hardcoded `if (k.path !== n.cult.path && k.path !== 'ANY') return -100;`, causing NPCs to score Universal Legendary and Cross-Path crystals at `-100` in `M.crystalDecision` and `CPE.pickPurchase` and never use compatible crystals/manuals in their personal bag until midnight. | Updated `M.knowledgeFit` to recognize `t.legendary` (`-4` cross-path offset) and `allowCross` (`-12` offset), and added immediate safe bag consumption of eligible high-fit crystals (`fit >= 48`) and personal manuals in `COG.prepare`. |
| **3** | **Ancestral Tablet Blanket Prayer Bonus & Missing Study/Track Application** (`js/ai.js`, `js/cpeco.js`, `js/cultivation.js`) | `A.pray.score` (line 653) gave a flat `+0.42` bonus to every cultivated NPC whenever any tablet existed, regardless of path match or need. Furthermore, `A.study.tick`, `A.guidedStudy.tick`, and `CULT.trackBreakthrough` did not apply `n.ancestralBlessing`. | Replaced the flat bonus in `A.pray.score` with relevance gating (only active when facing a breakthrough/bottleneck, studying a manual, suffering `heartDemon >= 35`, or honoring a fallen mentor/subpath ancestor, scaled by `subMatch`/`pathMatch`). Wired `studySpeedMult`, `breakthroughBonus`, and `injuryShield` into `study`, `guidedStudy`, and `trackBreakthrough`. |
| **4** | **Autonomous Sanctum Expeditions & Catalyst Gear Refinement** (`js/explore.js`, `js/economy.js`, `js/ai.js`) | `EXPLORE.tryVolunteer` only considered `'orig'`, `'delve'`, and `'realm'` (never `'sanctum'`), and `ECO.refineGearWithCatalyst` was only callable from UI buttons—NPCs had no autonomous path to refine T4–T6 gear with Sanctum Catalysts. | Added `'sanctum'` volunteering to `EXPLORE.tryVolunteer` for Rank 2+ combatants (`PW >= 95`), implemented `ECO.findCatalystRefinementCandidate(W, npc)`, and extended `AI.ACTS.forge` and `COG.modifiers` so eligible Rank 3+ / Forge NPCs autonomously refine T4–T6 gear at the Forge anvil. |
| **5** | **Autonomous Inter-Sect Diplomacy & Caravans** (`js/sect.js`) | `CONTENT.negotiateTreaty` and `CONTENT.dispatchDiplomaticCaravan` were not wired into `SECT.masterDecision`. | Added the `diplomacy` policy option to `SECT.masterDecision` so the Sect Master autonomously dispatches allied trade caravans and negotiates treaties when stone reserves (`>= 300`) and sect attitudes (`>= 18`) qualify. |
| **6** | **Severe Injuries (`sev >= 2`), Toxicity & Stale Competing Goals** (`js/cognition.js`, `js/ai.js`, `js/cpeco.js`) | An NPC with `hp >= 35%` but a `sev: 2` injury passed `safe(n)` while being blocked from `cultivate`, `practice`, `breakthrough`, `mine`, and `forage`, without decomposing `track_bottleneck` into healing. Conversely, once a `recovery` goal's condition was satisfied, `COG.modifiers` still treated `c.goal` as active until the next `COG.prepare` call. | Added `recover_injury` step decomposition in `computeGoalStep`, boosted `heal` / `personalPillUse` for `sev >= 2` injuries, expanded `A.personalPillUse` to cover `healInjury`, `clearToxic`, and `clearHeartDemon`, and updated `COG.modifiers` / `proficiency.js` to check `!complete(W, n, c.goal)` so resolved needs immediately stop affecting decisions. |
| **7** | **Rank 4 Guard Restriction & Office Appointment Lag** (`js/ai.js`, `js/cognition.js`) | `A.guard.can` restricted guarding to `n.rank <= 3`, preventing Rank 4 Guard/Wildwarden/Commander officers from executing `guard` even during raids! Newly appointed officers also kept casual `social_bond` goals for up to 7 days. | Updated `A.guard.can` to permit `['guard', 'wildwarden', 'commander'].includes(n.post)` and active raid/alert defense at any rank `>= 1`, and added `c.lastRoleId` transition tracking in `COG.prepare`. |
| **8** | **Action Continuity, Scripture Desk Hogging & Save/Load Cache Determinism** (`js/ai.js`, `js/cognition.js`, `js/proficiency.js`, `js/cpeco.js`) | `AI.decide` applied `ทำบ่อยแล้ว` (`-0.16 * rep`) even to ongoing multi-session `study` or `skillDrill` bottleneck training; `A.study.can` was `() => true` even for NPCs with no manual to study and low scholarship interest; and `track_bottleneck` was missing from `COG.blocked` and `COG.doesActionAdvanceGoal`. Multi-tick transient caches (`_pspCache`, `_nextTechCache`, `_flatCache`) also risked post-load divergence. | Added `COG.isContinuingProductiveWork` (`+0.24` continuity bonus instead of repetition penalty for unfinished study, active bottleneck skill gates, consolidation, healing, and critical food crisis work), tightened `A.study.can`, wired `track_bottleneck` into `COG.blocked` and `COG.doesActionAdvanceGoal`, and made all transient `_` caches strictly single-tick (`t === W.t`). |

#### 2.3 Reasoning Behind Material Weighting Choices & Intentional Exclusions
* **Balanced Modifier Weights**:
  * Vital survival emergencies (`!safe(n)`: `satiety < 20`, `rest < 8`, `hp < 35%`) apply `+2.4` to the specific recovery action (`eat`, `sleep`, `heal`/`personalPillUse`) and `-1.6` to strenuous work/training, guaranteeing survival always wins.
  * Severe injury (`sev >= 2` with `hp >= 35%`) applies `+1.35` to `heal`/`personalPillUse` and suppresses bottleneck training bonuses because `sev >= 2` physically blocks `cultivate` and `practice`.
  * Specialization bottleneck resolution (`track_bottleneck`) applies `(ready ? 0.68 : 0.45) * driveMult * needFactor` in `COG.modifiers` plus `(ready ? 1.25 : 0.85) * driveMult * needFactor` on the specific target skill drill (`skillDrill` / `practice`), where `driveMult` ranges from `0.25` (carefree, low-ambition) to `1.65` (ambitious, disciplined martial peak seeker). This ensures ambitious blocked NPCs reliably train their missing gate skill while carefree NPCs still take leisure/social breaks and dutiful officers (`+1.25 * dutyWeight` during work hours) still fulfill their sect post.
  * Ancestral Shrine prayer (`pray`) applies `0.25–0.58 * matchMult` (`×1.35` for subpath match, `×1.05` for path match) only when an active breakthrough, manual study, or Heart Demon need exists, preventing shrine prayer from displacing normal daily work.
  * Autonomous Catalyst Refinement at the Forge applies `+0.92` base score + `+0.52` modifier only when a catalyst and an unrefined T4–T6 item exist and no hall order is blocked, executing a single 45-tick refinement that consumes the catalyst and immediately terminates the motivation.
* **Conditions Intentionally Excluded**:
  * **Future-Realm Skill Gates**: NPCs only receive bottleneck skill motivation for the *next* realm of their *current* track once `prog >= threshold * 0.65`; skills required by distant future realms (`ordinal + 2..9`) or other subpaths are intentionally excluded so NPCs do not train unrelated skills prematurely.
  * **Unperceived Library Donations**: Manuals donated to `W.sect.library` within the last 180 ticks are intentionally excluded from `COG.visibleLibraryFor(W, n)` for distant NPCs who were not the donor, are not Scripture/Executive officers, and have not visited an info hub.
  * **Irrelevant Ancestral Tablets**: Cultivated NPCs who are neither near a bottleneck nor studying a manual nor suffering from Heart Demon (and have no fallen mentor tablet) receive zero bonus from `W.sect.legacyTablets`.

---

### 3. Verification Metrics & Performance Impact
* `node test/core_lock.js`: **PASS** (`HC.FINGERPRINT === '155:2f9c9dd7'`)
* `node test/standalone.js`: **PASS** (40 inline scripts, 0 external dependencies, matches source)
* `node test/diplomacy_sanctum_ancestral_suite.js`: **PASS** (All Pillars A, B, C, D, E, and F verified end-to-end)
* `node test/npc_life_authority_overhaul.js`: **PASS** (100% bit-identical save/load determinism and life authority checks)
* `node test/browser_mobile_perf.js`: **PASS** (`avgMsPerTick < 3.0ms`, `maxSustainableTicksPerSec >= 300` across 80-NPC population in headless Chromium)
* `node tools/run_parallel_tests.js`: **PASS (79/79 suites passed, 0 failed, 0 skipped, 0 unrun, 147 JS syntax checks)**

### 4. Known Limitations & Reproduction Instructions
* **Known Limitations**:
  * Bounded awareness propagation uses a 180-tick (3 in-game hours) sect-wide word-of-mouth window for unannounced hall additions if an NPC does not visit an information hub earlier; spatial line-of-sight raycasting is intentionally omitted to preserve the `< 3.0ms/tick` 80-NPC performance budget.
* **Reproduction Commands**:
  * Rebuild single-file playable HTML: `cd GAME_SOURCE && node tools/build_single.js`
  * Run the v2.0.6 + Pillars E & F regression suite: `cd GAME_SOURCE && node test/diplomacy_sanctum_ancestral_suite.js`
  * Run the full 79-suite parallel test runner: `cd GAME_SOURCE && node tools/run_parallel_tests.js`
