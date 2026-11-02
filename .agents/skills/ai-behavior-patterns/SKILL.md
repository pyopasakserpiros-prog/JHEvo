---
name: ai-behavior-patterns
description: Design, extend, and audit JianghuSect Evolution's NPC Psychological Utility AI (js/ai.js), Goal-Driven Cognition (js/cognition.js), and 12-Layer Human Core (js/human_core.js) decision-making, aspirations, sect offices, social interactions, and station lifecycle.
origin: jianghusect-custom
category: npc-cognition-ai
---

# JianghuSect NPC Brain: Psychological Utility AI & Goal-Driven Cognition

## Purpose
Provide a complete, project-specific engineering blueprint for designing, extending, tuning, and debugging NPC thought processes, decision-making, autonomous schedules, sect office duties, and social interactions in **JianghuSect Evolution (JHEvo)**.

Use this skill whenever:
- Adding or modifying NPC activities in `GAME_SOURCE/js/ai.js` (`AI.ACTS` / `A[id]`)
- Adding or tuning NPC aspirations, multi-step goals, office duties, or situational awareness in `GAME_SOURCE/js/cognition.js` (`COG`)
- Integrating new facilities, cultivation paths (across all 9 Major Paths), support doctrines, or sect policies into autonomous NPC behavior
- Debugging why NPCs choose (or fail to choose) specific actions, station occupancy leaks, or tick performance regressions

---

## 1. Architecture Overview: The 3-Pillar NPC Brain

JianghuSect NPCs do not use rigid scripted trees or blind random rolls. Every decision emerges from the interaction of three core modules:

### Pillar 1: `HC` (`GAME_SOURCE/js/human_core.js`) — The Immutable 12-Layer Identity
> **CRITICAL INVARIANT**: `js/human_core.js` is locked (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 locked). **NEVER modify `js/human_core.js`**. Store new system state on `npc.ext[<system>]` or top-level NPC fields, and apply temporary/permanent stat adjustments via `npc.mods`.

Always read effective NPC traits via `HC.eff(npc, 'layer.id')` (cached per `HC.nowDay` and `npc._ver`), which returns a clamped `0..100` score factoring in innate genome, constitution, bloodline/acquired traits, temporary modifiers, and biological age curves:

- **14 Personality Traits (`personality.<id>`)** — *"How the NPC tends to act"*:
  - **DRIVE**: `ambition` (ความทะเยอทะยาน), `discipline` (วินัยและความเพียร)
  - **COGNITION**: `caution` (ความรอบคอบระแวดระวัง), `curiosity` (ความใฝ่รู้), `creativity` (ความคิดสร้างสรรค์), `rationality` (ความเป็นเหตุเป็นผล)
  - **SOCIAL**: `empathy` (ความเมตตาเห็นอกเห็นใจ), `trustfulness` (ความเปิดใจไว้ใจผู้อื่น), `loyalty` (ความภักดีและกตัญญู), `integrity` (ความซื่อตรงและยุติธรรม)
  - **CONFLICT**: `aggression` (ความดุดันก้าวร้าว), `courage` (ความกล้าหาญเด็ดเดี่ยว), `pride` (ความหยิ่งทะนงในศักดิ์ศรี)
  - **MIND**: `composure` (ความมั่นคงทางอารมณ์)
- **8 Core Life Values (`values.<id>` & fulfillment `npc.h.fulfil.<id>`)** — *"What matters to the NPC"*:
  - `familyClan` (พวกพ้อง), `sectDuty` (หน้าที่ต่อสำนัก), `martialPeak` (วิถียุทธ์), `knowledgeCraft` (ความรู้), `freedom` (อิสรภาพ), `wealthResource` (ทรัพย์), `powerStatus` (อำนาจ), `honorLegacy` (เกียรติยศ)
  - *Mechanism*: As `npc.h.fulfil[key]` decays (`-0.0042/min`), the deficit `(100 - fulfil[key]) / 100` multiplied by `HC.eff(npc, 'values.' + key)` drives the NPC to seek activities that replenish that value via `AI.vf(npc, { [key]: amount })`.
- **6 Aptitudes (`aptitudes.<id>`)**:
  - `cultivation`, `comprehension`, `combat`, `crafting`, `command`, `socialCommerce`
- **23 Affinities (`affinities.<id>`)**:
  - **CRAFT**: `ALCHEMY`, `FORGING`, `ARRAY`, `TALISMAN`, `BEAST_TAMING`, `POISON`, `MEDICINE`, `SCRIPTURE`
  - **MARTIAL**: `SWORD`, `BLADE`, `SPEAR`, `FIST_PALM`, `MOVEMENT`, `BODY_REFINING`, `SOUL_DIVINE`
  - **ELEMENT**: `FIRE`, `WATER_ICE`, `LIGHTNING`, `WIND`, `EARTH_METAL`, `WOOD_LIFE`, `YIN_SHADOW`, `LIGHT_YANG`
- **7 Temperaments (`temperament.<id>`)**:
  - `sociability`, `energyLevel`, `emotionalReactivity`, `optimism`, `humor`, `sensationSeeking`, `affection`
- **24 Interests (`interests.<id>`)** — *"What brings joy, even if unskilled"*:
  - `combat`, `meditation`, `alchemy`, `forging`, `arrays`, `medicine`, `scholarship`, `herbs`, `beasts`, `labor`, `trade`, `leading`, `teaching`, `socializing`, `exploring`, `arts`, `cuisine`, `gambling`, `collecting`, `intrigue`, `solitude`, `worship`, `building`, `romance`
- **22 Physiology (`physiology.<id>`) & 18 Intellect (`intellect.<id>`)**:
  - Key physiology: `strength`, `explosiveness`, `speed`, `agility`, `reflex`, `dexterity`, `endurance`, `toughness`, `recoveryRate`, `vitality`, `senseAcuity`, `spiritualFoundation`, `meridianCapacity`, `meridianIntegrity`
  - Key intellect: `reasoning`, `comprehension`, `memory`, `workingMemory`, `learningSpeed`, `thinkingSpeed`, `focus`, `spatial`, `planning`, `judgement`, `inventiveness`, `intuition`, `perceptiveness`, `readPeople`, `wisdom`, `willpower`
- **Derived Composite Indices (`HC.derived(npc)`)**:
  - `riskTolerance`, `powerSeeking`, `materialism`, `independence`, `adaptability`, `patience`, `vengefulness`, `physicalIndex`, `intelligenceIndex`, `socialIndex`, `cultivationTalent`
- **Dynamic Physiological/Mental State (`npc.h.state`)**:
  - `hp`, `qi`, `satiety` (0..100), `rest` (0..100), `energy` (0..100), `social` (0..100), `loneliness` (0..100), `novelty` (0..100), `mood`, `stress`, `anger`, `fear`, `heartDemon` (0..100)

---

### Pillar 2: `COG` (`GAME_SOURCE/js/cognition.js`) — Aspirations, Goals, Sect Offices & Bounded Awareness
`COG` provides high-level intentionality over top of minute-to-minute needs.

1. **Deterministic Evaluation (NO RNG)**:
   - Never use `Math.random()` or `W.rng` inside `cognition.js` scoring, aspiration ranking, or `COG.explain()`. Cognitive state and explanations must be 100% deterministic from world/NPC state.
2. **Long-Term Aspirations (`ASPIRATIONS`)**:
   - Examples: `martial_master`, `realm_ascendant`, `master_alchemist`, `master_artificer`, `benevolent_healer`, `respected_mentor`, etc.
   - Each aspiration defines `prefGoals` that bias which medium-term goal the NPC adopts.
3. **Multi-Step Goals (`npc.cognition.goal` & `suspendedGoal`)**:
   - Goals (`breakthrough`, `scripture`, `gear_upgrade`, `craft`, `crisis`, `service`, `help_friend`, `mentor_disciple`, `investigate_clue`, `rival`) track `step`, `stepTitle`, `missingPrereq`, and `blockReason`.
   - When an urgent crisis or physiological need preempts a goal, suspend it cleanly into `suspendedGoal` rather than wiping progress.
4. **18 Sect Offices (`COG.OFFICE`)**:
   - `master`, `deputy`, `commander`, `provision`, `herbal`, `wildwarden`, `steward`, `martial`, `alchemy`, `forge`, `scripture`, `discipline`, `treasury`, `mission`, `guard`, `registry`, `healer`, `disciples`.
   - Office holders receive targeted utility boosts in `COG.modifiers(W, n, actId, S)` and record autonomous policy/operational decisions in `npc.cognition.officeDecision`.
5. **Bounded Awareness (`COG.isAwareOf` & `COG.evaluateSituationalAwareness`)**:
   - NPCs are not omniscient. They only act on new library scriptures, clues, or ancestral tablets if they have perceived them or met awareness conditions.
   - `COG.explain(W, n)` returns `{ role, aspiration, goal, suspendedGoal, commitment, deferenceToMaster, estimates, reasons, bottleneck, situational, officeDecision }` for the UI Mind/Cognition inspect tab.

---

### Pillar 3: `AI` (`GAME_SOURCE/js/ai.js`) — Utility Scoring (`ScoreAcc`), Softmax Selection & Lifecycle
Every minute (`AI.step`), idle NPCs evaluate candidate activities in `AI.decide(W, n)`:

1. **Pre-Decision Cognitive Sync**: Calls `COG.prepare(W, n)`.
2. **Candidate Filtering & Scoring**:
   - Skips any activity `id` where `n.cool[id] > W.t` or `a.can(n, W)` returns `false`.
   - Instantiates `const S = Sc();` (`ScoreAcc`), calls `a.score(n, W, S)`, then applies cognitive/goal/office modifiers via `COG.modifiers(W, n, id, S)`.
   - Applies anti-oscillation repetition penalty (`ทำบ่อยแล้ว`) based on `n.recent` (last 6 actions), **except** when `COG.isContinuingProductiveWork(W, n, id)` is true (`ทำต่อเนื่องให้สำเร็จ`, `+0.24`).
3. **Personality-Driven Softmax Selection**:
   - Sorts candidates by total utility `S.u`.
   - Computes choice temperature `temp` (`0.05..0.40`) from `sensationSeeking`, `creativity`, `emotionalReactivity` (higher randomness/exploration) minus `discipline` (strictly picks highest utility).
   - Samples from top-6 candidates using weighted softmax `Math.exp((c.S.u - maxU) / temp)`, with up to 2 fallback candidates (`S.u > -0.5`) if top stations are occupied.
4. **Station Resolution & Commitment**:
   - Calls `a.where(W, n)`. If `null` (no station/resource available), calls `COG.blocked(W, n, id)`, logs facility demand via `SECT.recordFacilityDemand(W, id, 'failed_station', n)`, and sets `n.cool[id] = W.t + 25`.
   - If valid, calls `AI.begin(W, n, id, w, why)`, reserves station (`AI.reserve`), sets `n.why` (top 4 reasons by magnitude), and notifies `COG.chosen(W, n, id, why)`.

---

## 2. Mandatory Engineering Rules for NPC AI Changes

### Rule 1: Every Utility Contribution MUST Have a Thai Reason (`S.add`)
- **NEVER** modify `S.u` directly. Always call `S.add('เหตุผลภาษาไทย', numericWeight)`.
- `ScoreAcc.prototype.add` automatically records any weight with `Math.abs(v) > 0.06` into `S.why`, which populates `npc.why` in the UI HUD and NPC inspection sheet.
- Use built-in helpers in `js/ai.js`:
  - `valueTerm(n, { martialPeak: 0.5, sectDuty: 0.3 }, S)` — weights by `(100 - fulfil[k])` and `values[k]`.
  - `interestTerm(n, 'alchemy', S, 1.15)` — weights by `(HC.eff(n, 'interests.alchemy') - 48) / 100`.
  - `AI.dutyWeight(n)` — cached multiplier (`0.2..1.4`) combining `discipline`, `loyalty`, and `sectDuty`.

### Rule 2: 9-Path Equivalence in Station & Activity Logic
JianghuSect has **9 Major Cultivation Paths**:
`XIAN`, `BODY`, `GOD`, `DEMON`, `HEART_SOUL`, `MECH_PUPPET`, `KARMA_SAMSARA`, `BEAST_SOVEREIGN`, `SAGE_SUPPORT`.
- Whenever an activity checks cultivation path (such as `cultivate`, `breakthrough`, `practice`, `supportBless`, or facility usage):
  - Provide appropriate station routing in `where(W, n)` for all 9 paths (including specialist facilities `mech_workshop`, `beast_menagerie`, `harmonic_pavilion`, plus fallback to `meditation_hall`, `training_ground`, `shrine`, or personal `bed`).
  - Use `CULT.equivalentStage(n)` rather than raw `n.cult.stage` when scaling rest drain, thresholds, or rewards, because path stage counts differ (4, 5, 8, or 9 stages).

### Rule 3: Anti-Thrashing & Need/Value Satisfaction Loop
An NPC will loop endlessly on an activity if the activity's `score()` stays high after completion. Every activity MUST close its feedback loop:
1. **Satisfy the driving state/value** in `tick()` or `done()` (e.g., `AI.vf(n, { knowledgeCraft: 0.35 })`, or restoring `s.satiety`, `s.rest`, `s.social`, `s.novelty`, or clearing the goal step in `COG.finished`).
2. **Set `cooldown`** on the activity definition or `n.cool[id]` on abort/failure so failed station lookups do not re-run every single tick.
3. **Respect `AI.interrupt(W, n)`** (checked every 5 game minutes): critical hunger (`satiety < 24`), critical injury (`hp < 35%`), or exhaustion (`rest < 6`) will preempt non-locked activities (`breakthrough`, `fight`, `sentence` are interrupt-locked).

### Rule 4: Strict Station Reservation & Cleanup (`AI.reserve` / `AI.release`)
- Always acquire stations through `AI.freeStation(W, n, kind, buildingKeyOrList, opts)`.
- Let `AI.begin` call `AI.reserve(W, n, w.st)` and `AI.step` / `AI.cancelAct` / `AI.interruptFor` call `AI.release(W, n)`.
- If an activity claims external resources (e.g., wild resource nodes or pair partner commitments), implement `cleanup(n, W)` on the activity definition so `AI.interruptFor(W, n)` releases them cleanly without memory or lock leaks.

### Rule 5: Performance Budget (< 3.0 ms/tick for 80 NPCs)
- `AI.step` runs every game minute for every living NPC; `AI.decide` runs whenever an NPC finishes an action.
- **Never** allocate large temporary arrays or scan all 240×192 map tiles inside `can()` or `score()`.
- When training body/mind stats inside `tick()` (e.g., every 20–30 ticks), always use `HC.trainBody(n, id, load)`, `HC.trainMind(n, id, load)`, and `HC.gainWisdom(n, amt)` — `js/ai.js` wraps these so `n._ver` cache invalidation only triggers when the integer stat value actually changes.

---

## 3. Template: Adding a New NPC Activity in `js/ai.js`

```javascript
A.exampleActivity = {
  nameTh: 'ชื่อกิจกรรมภาษาไทย',
  icon: '✨',
  color: '#6ec6ff',
  cooldown: 45, // Cooldown in game minutes after completion

  // 1. Fast O(1) eligibility gate
  can: (n, W) => {
    if (!n.cult || n.h.state.rest < 18 || n.h.state.satiety < 20) return false;
    return true;
  },

  // 2. Psychological Utility Scoring (MUST use S.add with Thai labels)
  score(n, W, S) {
    const dw = AI.dutyWeight(n);
    S.add('แรงจูงใจพื้นฐาน', 0.45 * dw);
    valueTerm(n, { knowledgeCraft: 0.4, sectDuty: 0.25 }, S);
    interestTerm(n, 'scholarship', S, 1.1);
    S.add('ความใฝ่รู้', (E(n, 'personality.curiosity') - 50) / 140);
  },

  // 3. Station / Target Location Resolution
  where(W, n) {
    const st = AI.freeStation(W, n, 'study', 'library') || AI.freeStation(W, n, 'meditate', 'meditation_hall');
    return st ? { st } : null;
  },

  // 4. Duration in game minutes
  dur: (n, W, ctx) => Math.round(60 + E(n, 'personality.discipline') * 0.6),

  // 5. Arrival hook (return false to cancel and cooldown)
  start(n, W, ctx) {
    return true;
  },

  // 6. Per-minute execution hook ('done' or 'abort' to end early)
  tick(n, W, ctx) {
    const s = n.h.state;
    s.energy = Math.max(0, s.energy - 0.03);
    if (W.t % 25 === 0) {
      HC.trainMind(n, 'comprehension', 0.8);
    }
    AI.vf(n, { knowledgeCraft: 0.03 });
    if (s.energy < 10 || s.rest < 10) return 'done';
  },

  // 7. Completion rewards, memories & progression
  done(n, W, ctx) {
    n.merit += 0.3;
    AI.vf(n, { sectDuty: 0.2 });
    AI.mem(W, n, 'สำเร็จกิจกรรมตัวอย่าง', 0.35);
  },

  // 8. Interruption cleanup (optional, for external claims/locks)
  cleanup(n, W) {
    // Release any custom locks outside standard station reservation
  }
};
```

---

## 4. Auditing & Verification Checklist

Whenever modifying `js/ai.js` or `js/cognition.js`, run these targeted verification checks from `GAME_SOURCE/`:

1. **Core Lock & Data Integrity**:
   ```bash
   node test/core_lock.js
   node tools/validate_data_schema.js
   ```
2. **NPC Cognition, Offices & Decision Suites**:
   ```bash
   node test/npc_cognition.js
   node test/npc_offices.js
   node test/npc_command.js
   node test/npc_social_help.js
   node test/npc_life_authority_overhaul.js
   node test/v209_facilities_party_synergy_suite.js
   ```
3. **Diagnostic Inspection in Code**:
   - Check `npc.why` (array of `[reasonTh, weight]`) — must never be empty when an NPC is executing a chosen activity.
   - Check `COG.explain(W, npc)` — verify `role`, `aspiration`, `goal`, `reasons`, and `situational` contain accurate Thai text and zero `NaN`/`undefined` values.
