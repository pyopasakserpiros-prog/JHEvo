---
name: ai-behavior-patterns
description: Design, extend, and audit JianghuSect Evolution's NPC Psychological Utility AI (js/ai.js), Goal-Driven Cognition (js/cognition.js), and 12-Layer Human Core (js/human_core.js) decision-making, aspirations, sect offices, social interactions, and station lifecycle.
---

# JianghuSect Evolution — Ultimate Master NPC AI, Cognition & Human Core Blueprint (`js/ai.js`, `js/cognition.js`, `js/human_core.js`)

This is the authoritative, line-referenced engineering blueprint for **JianghuSect Evolution (สำนักยุทธ์เจียงหู)**'s three-tier autonomous NPC mind:
1. **Tier 1 — 12-Layer Human Core (`js/human_core.js` — `g.HC`):** 155 psychological, physiological, intellectual, social, and destiny parameters, dynamic emotions, life experiences, and age curves.
2. **Tier 2 — Goal-Driven Cognition & Sect Governance (`js/cognition.js` — `g.COG`):** 6 Life Aspirations, 18 Sect Offices with automatic delegation/handover, Bounded Non-Omniscient Perception, Zero-RNG Heuristic Forecasting, 13 Multi-Horizon Goals with emergency suspension/resumption, 7-Dimensional Relationships, Mentoring, Altruism, Flattery, Treasury Embezzlement, and Discipline Audits.
3. **Tier 3 — Minute-by-Minute Psychological Utility AI (`js/ai.js` — `g.AI`):** 27+ scored actions (`AI.ACTS`), `ScoreAcc` Thai reasoning (`npc.why`), Boltzman softmax choice temperature (`COG.choiceTemperature`), A* pathfinding, and leak-free station reservation.

---

## 1. Non-Negotiable Core Invariants

1. **Human Core Fingerprint Lock (`js/human_core.js`):**
   - **NEVER** modify `GAME_SOURCE/js/human_core.js`. `HC.FINGERPRINT === '155:2f9c9dd7'` is SHA-256 locked and checked in `SIM.deserialize` and `test/run_all.js`.
   - Read effective traits via `HC.eff(npc, 'layer.key')` (aliased as `E(n, p)`), bump version via `HC.bump(npc)` (`npc._ver++`), shift emotions via `HC.feel(npc, { mood, stress, anger, fear })`, and record formative life events via `HC.experience(npc, kind, weight)`.
2. **Strict Zero-RNG Rule in `js/cognition.js` (`COG`):**
   - `COG.prepare`, `COG.modifiers`, `COG.forecast`, `COG.evaluateTech`, `COG.evaluateSituationalAwareness`, and `COG.explain` **must NEVER advance `W.rng` or call `Math.random()`** when inspecting or scoring.
   - Only `COG.prepare` goal selection (`W.rng.weighted` when choosing a new goal) and `COG.performDuty` (actual action execution) may use `W.rng`.
   - `COG.explain(W, n)` and `COG.evaluateSituationalAwareness(W, n)` must be **100% pure read-only** (zero state mutation, zero RNG).
3. **Explainable Thai Utility Scoring (`ScoreAcc` / `S.add`):**
   - Every utility term in `js/ai.js` and `js/cognition.js` must push a human-readable Thai reason via `S.add('เหตุผลภาษาไทย', weight)`.
   - Top 4 reasons sorted by `Math.abs(weight)` are stored in `npc.why` (`[['เหตุผล', weight], ...]`) and displayed live on the HUD (`#selAct`) and NPC Mind tab.
4. **Station Reservation & Release Discipline (`js/ai.js` lines 55–85):**
   - Every station reserved via `AI.reserve(W, n, st)` (`st.occ = n.id`, `n.act.st = st.id`, `b.inside.push(n.id)`) **must** be released via `AI.release(W, n)` on completion, interruption (`AI.interruptFor`), cancellation (`AI.cancelAct`), retirement (`SIM.retire`), or death (`AI.kill`).

---

## 2. Tier 1: The 12-Layer Human Core (`js/human_core.js` — `g.HC`)

### 2.1 Key Layers & Parameter Paths (`HC.eff(n, path)`)
- **`personality` (14):** `ambition`, `discipline`, `loyalty`, `integrity`, `empathy`, `courage`, `caution`, `pride`, `aggression`, `curiosity`, `creativity`, `rationality`, `composure`, `trustfulness`.
- **`values` (8 — `VAL_IDS`):** `martialPeak`, `knowledgeCraft`, `sectDuty`, `familyClan`, `freedom`, `wealthResource`, `powerStatus`, `honorLegacy`.
  - Fulfilment tracked in `n.h.fulfil[valKey]` (`0..100`), decaying by `-0.0042/min` in `AI.needs` and replenished via `AI.vf(n, { [valKey]: delta })`.
- **`temperament`:** `sociability`, `sensationSeeking`, `optimism`, `humor`, `affection`, `emotionalReactivity`.
- **`interests` (24 — `INT_IDS`):** `combat`, `weapons`, `innerQi`, `scholarship`, `alchemy`, `forging`, `herbs`, `medicine`, `exploring`, `socializing`, `teaching`, `romance`, `arts`, `solitude`, `cuisine`, `worship`, `commerce`, etc.
- **`physiology` (16):** `vitality`, `strength`, `agility`, `endurance`, `constitution`, `recoveryRate`, `painTolerance`, `longevity`, etc.
- **`intellect` (18):** `comprehension`, `focus`, `memory`, `planning`, `judgement`, `perceptiveness`, `readPeople`, `numeracy`, `tactics`, etc.
- **`social` (7):** `charisma`, `persuasion`, `intimidation`, `teaching`, `leadership`, `deception`, `etiquette`.
- **`affinities` (23):** 8 Elemental affinities + 15 Weapon/Art affinities (`SWORD`, `BLADE`, `SPEAR`, `FIST_PALM`, `STAFF`, `BOW`, `THROWING`, `ALCHEMY`, `FORGING`, `ARRAY`, `TALISMAN`, `MEDICINE`, `SCRIPTURE`, `BEAST`, `PUPPET`).
- **`state` (`n.h.state`):** `hp`, `qi`, `satiety` (`0..100`), `rest` (`0..100`), `energy` (`0..100`), `mood` (`-100..100`), `stress` (`0..100`), `social` (`0..100`), `loneliness` (`0..100`), `novelty` (`0..100`), `anger` (`0..100`), `fear` (`0..100`), `heartDemon` (`0..100`).

---

## 3. Tier 2: Goal-Driven Cognition & Sect Governance (`js/cognition.js` — `g.COG`)

### 3.1 Section 1: Long-Term Life Aspirations (`js/cognition.js` lines 67–204)
- **6 Archetypal Aspirations (`COG.ASPIRATIONS`):**
  1. `immortal_seeker` (`ผู้แสวงหามรรคาอมตะ`) — `prefGoals`: `['breakthrough', 'track_bottleneck', 'scripture']`.
  2. `martial_master` (`จอมยุทธ์ไร้เทียมทาน`) — `prefGoals`: `['rival', 'scripture', 'gear_upgrade', 'track_bottleneck']`.
  3. `sect_pillar` (`เสาหลักค้ำจุนสำนัก`) — `prefGoals`: `['service', 'crisis', 'mentor_disciple']`.
  4. `grand_artisan` (`ปรมาจารย์ศาสตร์โอสถและศาสตรา`) — `prefGoals`: `['craft', 'scripture', 'crisis']`.
  5. `benevolent_healer` (`ผู้เมตตาคุ้มครองสหาย`) — `prefGoals`: `['help_friend', 'mentor_disciple', 'crisis', 'social_bond']`.
  6. `peaceful_companion` (`ผู้รื่นรมย์ในมิตรภาพและสายลม`) — `prefGoals`: `['social_bond', 'help_friend', 'craft']`.
- **Bounded Hysteresis (`COG.ensureAspiration` lines 149–194):**
  - Evaluated at most once every 30 days (`day - c.aspiration.lastReviewDay >= 30`).
  - Only switches aspiration if held `>= 45` days (or promoted from `'member'` to an officeholder with `top.id === 'sect_pillar'`) AND `top.score > curScoreObj.score + 18`.
  - Matching `prefGoals` receive a **`+0.38` weight boost** during goal selection (`line 1022`).
  - Completing any non-recovery goal advances `asp.progress` by `+12%` and records a milestone in `asp.milestones` (capped at `8`, `COG.recordAspirationMilestone`).

### 3.2 Section 2: 18 Sect Offices, Jurisdiction & Automatic Delegation (`lines 34–65, 209–330`)
- **18 Office IDs (`COG.OFFICE`):**
  `master`, `deputy`, `commander`, `provision`, `herbal`, `wildwarden`, `steward`, `alchemy`, `forge`, `scripture`, `martial`, `guard`, `healer`, `mission`, `treasury`, `registry`, `discipline`, `member`.
- **Automatic Delegation When Unavailable (`COG.syncOfficeAuthority(W)` lines 263–330):**
  - Checked daily and during `COG.reviewOffices(W)`.
  - If an appointed officeholder (`W.sect.posts[post]`) is temporarily unavailable (`!COG.available(holder, W)`: `away`, `sealed`, `sealedBt`, `jail`, `punished`), `COG.syncOfficeAuthority` delegates authority in `W.sect.delegations[post] = { post, holderId, delegateId, since: W.t, until: W.t + 1440, reason }` to the highest-scoring available assistant (`x.assist === post`), deputy, or rank `>= 2` disciple with `SECT.relevance(post, x) >= 24`.
  - When the original holder becomes available again, `W.sect.delegations[post]` is automatically cleared (`line 301`).
  - **Authority Guardrail (`COG.performDuty` line 1969):** An ordinary assistant (`r.acting && !r.delegated`) helps in the hall but **cannot** overwrite official hall production orders (`W.sect.orders`).

### 3.3 Section 3: Bounded Non-Omniscient Perception & Heuristic Forecasting (`lines 335–505`)
- **Role-Scoped Knowledge (`COG.knowledgeScope(W, n)` lines 349–363):**
  - `canSeeFullTreasury`: only `['master', 'deputy', 'treasury', 'discipline']`.
  - `canSeeAuditEvidence`: only `['master', 'deputy', 'discipline']`.
  - `canSeeApplicantCA`: only `['master', 'deputy', 'registry']`.
  - `canSeeHiddenPA: false` — **Hard Invariant:** No NPC ever sees hidden Potential Ability (PA).
- **180-Tick Library Discovery Lag (`COG.isAwareOf` lines 374–395):**
  - When a technique is added to `W.sect.library` (`COG.recordHallAddition(W, 'library', itemId, actorId)`), other disciples do not magically know about it for `180` ticks unless they are `'scripture'`, `'master'`, `'deputy'`, the `actorId` who donated it, or currently performing `['study', 'guidedStudy', 'donate', 'duty', 'shop']`.
- **Zero-RNG Heuristic Forecasting (`COG.forecast(W, n, kind, target)` lines 425–505):**
  - `'affordability'`: Estimates `daysNeeded = deficit / dailyNet` to afford a manual or shop gear based on observed `n.cpEarned / daysInSect`.
  - `'huntRisk'`: Estimates `winProb` against a beast using `ownPower / (ownPower + bPower)`, shifted by `(courage - caution) * 0.08` and 14-day decaying zone memories (`'hunt_loss'` / `'hunt_win'`).
  - `'invitation'`: Estimates `acceptProb` for social invitations from affection, trust, gratitude, and partner's current activity.
  - `'reserves'`: Estimates sect `foodDays` and `stoneMonths` for `treasury`/`provision`/`master`.

### 3.4 Section 4: Deliberate Technique, Loadout & Gear Evaluation (`lines 510–651`)
- **Technique Preference (`COG.techPreference(n, t)` lines 510–549):**
  - Evaluates weapon/armor match (`M.conditionMatches`: `+0.8` or `-1.8` if missing required weapon), open passive slots (`+1.45`), passive family redundancy (`-1.25` if same family at `>= tier` is already active), combat archetype fit (`SK.profile(t).arch` vs `caution`, `aggression`, `empathy`), multi-move depth (`t.moveDefs.length`), elemental compatibility (`ELEM.resolveCompatibility`), and subpath match (`+3`).
- **Passive Loadout Reconciliation (`COG.reconcileLoadout(W, n)` lines 580–613):**
  - Preserves player-pinned passives (`n.passivePinned`) and excludes `n.passiveUnequipped`, deduplicates by `M.passiveFamilyOf(t)`, fills up to `M.maxPassiveSlots(n)`, and syncs resource caps (`M.syncResourceCaps(n)`).
- **Resonance-Aware Gear Upgrade (`COG.bestGearUpgrade(W, n)` lines 616–651):**
  - Checks personal bag first (free), then sect armory/shop (`W.sect.gear`), adding **`+45` (3-piece) or `+22` (2-piece)** when an item completes an Equipment Resonance Set (`M.resonanceUpgradePreview`), with a 720-tick swap cooldown (`n._lastGearSwapAt`).

### 3.5 Section 5: 13 Multi-Horizon Goals, Emergency Suspension & True Progress (`lines 656–1451`)
- **13 Goal Types (`c.goal.id`):**
  1. `recovery` (`พักรักษาตัวและฟื้นฟูกำลัง` — emergency override when `!safe(n)`).
  2. `service` (`ปฏิบัติงานในหน้าที่และกำกับดูแลหอ` — for officeholders).
  3. `crisis` (`เร่งผลิต/จัดหาของที่สำนักขาดแคลน` — responds to `W.sect.shortageDirectives`).
  4. `help_friend` (`นำโอสถไปมอบให้สหายที่บาดเจ็บ` — triggered when `empathy >= 48` and a friend has `hp < 55%`).
  5. `investigate_clue` (`สืบค้นและคลี่คลายเบาะแส` — links to `VC.pickActionableClueForNpc`).
  6. `mentor_disciple` (`ชี้แนะเคล็ดวิชาและทักษะให้ศิษย์/รุ่นน้อง` — for `rank >= 3` with `social.teaching >= 42`).
  7. `social_bond` (`กระชับมิตรไมตรีกับสหาย` — for `peaceful_companion`).
  8. `breakthrough` (`เตรียมตัวก้าวข้ามขอบเขต` — decomposes into `prepare_body`, `consolidate_gate`, `seclude`, or `accumulate_qi`).
  9. `track_bottleneck` (`แก้คอขวดสายเฉพาะทาง` — delegates to `CULT.inspectProgressionBottleneck(W, n)` for 9-Realm Track skill/stone gates).
  10. `scripture` (`ตั้งใจเรียนคัมภีร์` — decomposes into `seek_access`, `earn_cp`, or `study`).
  11. `gear_upgrade` (`จัดหาอุปกรณ์คู่กาย` — decomposes into `equip_gear`, `earn_cp`, `buy_gear`, or `craft_or_wait`).
  12. `craft` (`เก็บส่วนผสมเพื่อปรุงโอสถ/หลอมศาสตรา` — decomposes into `brew`, `hall_craft`, or `gather_input`).
  13. `rival` (`ฝึกฝนเพื่อก้าวข้ามคู่แข่ง/ศัตรู` — until `CULT.power(n) > CULT.power(rival) * 1.15`).
- **Emergency Goal Suspension & Resumption (`COG.prepare` lines 950–1000):**
  - If `!safe(n)` (`hp / hpMax < 0.35 || satiety < 20 || rest < 8`) while holding a non-recovery goal, `COG.prepare` saves the goal to `c.suspendedGoal` and switches `c.goal` to `'recovery'`.
  - Once `'recovery'` completes and `safe(n)` is true, `c.suspendedGoal` is restored with its `expiresAt` extended by the exact `pausedDur`!
- **True Progress Verification (`COG.doesActionAdvanceGoal` lines 1370–1451):**
  - `COG.finished(W, n, actId)` only updates `c.goal.lastProgress = W.t` if `COG.doesActionAdvanceGoal` confirms real state progress against `goal.progressSnap` (e.g. `n.cp > snap.cp`, `learning.got > snap.learningGot`, `curSum > snap.bnSkillSum`).

### 3.6 Sections 6–8: Relationships, Mentoring, Altruism, Flattery & Office Politics (`lines 1156–2024`)
- **Single-Object Per-Tick Modifier Cache (`n._cogModCtx` lines 1158–1245):**
  - `COG.modifiers(W, n, id, SAcc)` computes role duties, goal actions, office plans (`W.sect.officePlans`), and office orders (`W.sect.officeOrders`) once per decision tick on `n._cogModCtx`, applying compliance weighted by `COG.deferenceToward(W, n, officer)`.
- **7-Dimensional Relationships (`COG.relInfo` & `COG.deferenceToward` lines 1484–1529):**
  - Tracks `affection` (`a`), `trust` (`t`), `respect` (`r`), `love` (`l`), `rivalry` (`v`), `gratitude` (`g`), `fear` (`f`), `memResent`, and `deference` (`0..100` with Thai summary `summaryTh`).
- **Commitments & Concrete Mentoring (`lines 1531–1628`):**
  - `COG.startCommitment` / `COG.resolveCommitment` tracks pair invitations; broken commitments without emergency excuse (`raid`, `inj`, `!safe`) penalize `trust - 3` and record `'broken_commitment'`.
  - `COG.completeMentorLesson` practices the target skill AND directly boosts `student.cult.learning.got` by `14% * teachQuality/2` (or grants shared technique mastery via `SK.gainMastery`).
- **Altruism (`A.shareMedicine` & `A.giftItem` lines 1631–1754):**
  - `A.shareMedicine` delivers personal recovery pills to injured nearby friends (`hp < 55%`, `distance <= 12`), boosting `gratitude + 12`, `trust + 3`, `affection + 2`.
  - `A.giftItem` gifts `'gift-worthy'` surplus personal bag gear to compatible friends/disciples/spouses (`gratitude + 16`, `affection + 5`, `trust + 4`, 7-day cooldown).
- **Non-Omniscient Flattery (`A.flatter` & `COG.executeFlattery` lines 1759–1843):**
  - Ambitious/manipulative NPCs (`motive >= 14`) approach higher-rank officers. Target judges via `discern` (`readPeople`, `judgement`, `integrity`, `recentRepeat * 14` vs `pride`, `trustfulness`), yielding `'distrusted'` (`trust - 4`, `favor - 6`), `'welcomed'` (`affection + 3`, `favor + 5` capped at `+18`), or `'ignored'`.
- **Treasury Embezzlement & Discipline Investigation (`COG.performDuty` lines 1983–2020):**
  - A low-integrity, high-greed Treasurer (`integrity < 36 && greed > 65`) may skim `8..45` Spirit Stones (`W.sect.suspicion += 5`, logged in `W.sect.auditTrail`).
  - The Discipline Elder (`r.id === 'discipline'`) investigates when `suspicion > 0`, calling `SECT.exposeEmbezzle(W, tre, n)` if `integrity >= 45 || relBias < 25`, or delaying investigation if biased toward a close friend!

---

## 4. Tier 3: Minute-by-Minute Psychological Utility AI (`js/ai.js` — `g.AI`)

### 4.1 Decision Pipeline (`AI.decide(W, n)` — `js/ai.js` lines 1317–1366)
1. Calls `COG.prepare(W, n)` to update role, aspiration, perceptions, auto-bag items, and current goal step.
2. Iterates all actions in `AI.ACTS` (`A`), skipping `'hide'`, `'pair'`, actions on cooldown (`n.cool[id] > W.t`), and actions where `!a.can(n, W)`.
3. Scores each candidate via `S = new ScoreAcc()`:
   - Runs `a.score(n, W, S)` (base psychological/physiological utility).
   - Runs `COG.modifiers(W, n, id, S)` (goal step boost, office duty, office plans/orders, track bottleneck urgency, severe injury/toxic/heartDemon remedies, catalyst refinement, time-of-day, weather).
   - Penalizes action repetition unless `COG.isContinuingProductiveWork(W, n, id)` is true.
4. Evaluates `'pair'` social action separately and inserts into `cands`.
5. Selects action order using softmax temperature `T = COG.choiceTemperature(n)` (`0.06..0.40`), reserves the station via `a.where(W, n)` → `AI.begin(W, n, c.id, w, why)`, and records `COG.chosen(W, n, c.id, why)`.
   - If `a.where(W, n)` returns `null` (station full), calls `COG.blocked(W, n, c.id)` and `SECT.recordFacilityDemand(W, c.id, 'failed_station', n)` so the Steward (`steward`) can propose upgrading the congested building!

### 4.2 Protected Actions & Interrupt Rules (`js/ai.js` lines 1090–1098, 1443–1455)
- **`AI.PROTECTED_ACTS`:** `sleep`, `eat`, `heal`, `supportBless`, `breakthrough`, `fight`, `sentence`, `hide`, `pair`, `brew`, `forge`, `brewBasic`, `personalBrew`, `paidTraining`, `guidedStudy`, `retrain`, `specialize`, `wildHunt`, `guard` (plus `duty` and `study >= 65%`) cannot be interrupted by casual social invitations (`AI.isProtectedAction`).
- **Every-5-Tick Emergency Interrupt (`AI.interrupt(W, n)` lines 1443–1455):**
  - Interrupts non-critical actions if jailed (`n.jail > W.t`), starving (`satiety < 24` with meals in stock), critically injured (`hp < hpMax * 0.35`), exhausted (`rest < 6`), or when a Sect Festival starts (`W.sect.festival.startAt === W.t`).
- **Stage-Scaled Meditation Rest Recovery (`AI.needs` lines 1405–1415):**
  - When `id === 'cultivate'` and `eqStage > 0` (`CULT.equivalentStage(n)`), cultivation **recovers** `s.rest` (`+0.025 + eqStage * 0.02`) and `s.energy` instead of draining rest, while higher `eqStage` reduces daytime rest drain (`restDrainMult`).

---

## 5. How to Add or Extend an AI Action / Goal Safely (Step-by-Step Template)

```javascript
A.myNewAction = {
  nameTh: 'ชื่อกิจกรรมภาษาไทย', icon: '✨', color: '#6ddfb5', cooldown: 120,
  can: (n, W) => !!(n.cult && n.h.state.energy > 30 && n.h.state.satiety > 25 && !(n.inj && n.inj.some(i => i.sev >= 2))),
  score(n, W, S) {
    S.add('เหตุผลหลักภาษาไทย', 0.65 + (E(n, 'personality.diligence') - 50) / 200);
    valueTerm(n, { martialPeak: 0.5, sectDuty: 0.4 }, S);
    interestTerm(n, 'combat', S, 0.4);
  },
  where(W, n) {
    const s = AI.freeStation(W, n, 'spar', 'training_ground');
    return s ? { st: s } : null;
  },
  dur: n => 60,
  start(n, W, ctx) { return true; },
  tick(n, W, ctx) {
    n.h.state.energy = Math.max(0, n.h.state.energy - 0.05);
    AI.vf(n, { martialPeak: 0.04 });
    if (n.h.state.energy < 10) return 'done';
  },
  done(n, W, ctx) {
    n.merit = (n.merit || 0) + 0.5;
    HC.bump(n);
  }
};
```
1. If the action advances a `COG` goal, add its ID to `computeGoalStep` (`lines 706–816`), `COG.modifiers` (`lines 1170–1185`), and `COG.doesActionAdvanceGoal` (`lines 1370–1438`).
2. If the action should not be interrupted by social `pair` invites, add its ID to `AI.PROTECTED_ACTS` (`js/ai.js` line 1090).

---

## 6. Mandatory AI & Cognition Verification Suites
```bash
node GAME_SOURCE/test/test_npc_cognition.js
node GAME_SOURCE/test/test_autonomous_sect_governance.js
node GAME_SOURCE/test/test_sect_delegation_hierarchy.js
node GAME_SOURCE/test/test_sim_ai.js
node GAME_SOURCE/test/test_perf_80x_benchmark.js
```
