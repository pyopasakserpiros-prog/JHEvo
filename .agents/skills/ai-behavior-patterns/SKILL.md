---
name: ai-behavior-patterns
description: Use when changing JianghuSect NPC decisions, cognition, aspirations, office roles, relationships or station behavior.
origin: jianghusect-custom
category: ai-cognition-behavior
---

# JianghuSect Evolution — Master NPC AI, Cognition & Human Core Blueprint (`js/ai.js`, `js/cognition.js`, `js/human_core.js`)

> **Current baseline 2.0.28:** This project-specific skill contains historical material from earlier versions. The targeted corrections below do not certify every older formula or API. Before implementing, verify the relevant behavior against current source and tests; use `project_status_and_ai_onboarding.md` for the current feature inventory and `AGENTS.md` for project rules.

This is the authoritative, source-verified engineering blueprint for **JianghuSect Evolution (สำนักยุทธ์เจียงหู) v2.0.17**'s three-tier autonomous NPC mind:
1. **Tier 1 — 12-Layer Human Core (`GAME_SOURCE/js/human_core.js` — `g.HC`):** 155 psychological, physiological, intellectual, social, and destiny parameters (`HC.FINGERPRINT === '155:2f9c9dd7'`), dynamic emotions, life experiences, and age curves.
2. **Tier 2 — Goal-Driven Cognition & Sect Governance (`GAME_SOURCE/js/cognition.js` — `g.COG`):** **9 Life Aspirations**, **NPC office and role definitions** (`COG.OFFICE`) with automatic delegation/handover, Bounded Non-Omniscient Perception, Zero-RNG Heuristic Forecasting, **Build Improvisation (`COG.evaluateBuildImprovisation`)**, **13 Multi-Horizon Goals** with emergency suspension/resumption, 7-Dimensional Relationships, Direct Mentorship, Altruism, Flattery, Treasury Embezzlement, and Discipline Audits.
3. **Tier 3 — Minute-by-Minute Psychological Utility AI (`GAME_SOURCE/js/ai.js` — `g.AI`):** **42+ scored actions (`AI.ACTS`)** across core & expansion modules, **12-Path specialized cultivation**, **10-Weapon martial choice (`MC_IDS`)**, Active Technique Retention guard (`CULT.techRetentionScore`), Direct Mentorship Coaching & Dying-Wish Qi Transmission (`SECT.MENTORSHIP`), `ScoreAcc` Thai reasoning (`npc.why`), Boltzmann softmax choice temperature (`COG.choiceTemperature`), A* pathfinding, and leak-free station reservation.

---

## 1. Non-Negotiable Core Invariants

1. **Human Core Fingerprint Lock (`js/human_core.js`):**
   - Preserve `GAME_SOURCE/js/human_core.js` as directed by `AGENTS.md`. `HC.FINGERPRINT === '155:2f9c9dd7'` is a stat-path fingerprint, not a SHA-256 file hash; check file identity separately.
   - Read effective traits via `HC.eff(npc, 'layer.key')` (aliased as `E(n, p)`), bump version via `HC.bump(npc)` (`npc._ver++`), shift emotions via `HC.feel(npc, { mood, stress, anger, fear })`, and record formative life events via `HC.experience(npc, kind, weight)`.
   - **Fast-Train Cache Preservation (`js/ai.js` line 15):** `HC.trainBody`, `HC.trainMind`, and `HC.gainWisdom` are wrapped once (`HC._fastTrainWrapped`) so sub-integer increments only invalidate the single changed key in `npc._c.v` without wiping `npc._d`, `npc._cs`, or `npc._csBase` unless integer thresholds change `hpMax`.
2. **Strict Zero-RNG Rule in `js/cognition.js` (`COG`):**
   - `COG.evaluateAspirations`, `COG.modifiers`, `COG.forecast`, `COG.techPreference`, `COG.evaluateTech`, `COG.evaluateBuildImprovisation`, `COG.evaluateSituationalAwareness`, and `COG.explain` **must NEVER advance `W.rng` or call `Math.random()`**.
   - Only `COG.prepare` goal selection (`W.rng.weighted` when choosing a new goal) and `COG.performDuty` / `COG.executeFlattery` (actual action execution) may use `W.rng`.
   - `COG.explain(W, n)` and `COG.evaluateSituationalAwareness(W, n)` must be **100% pure read-only** (zero state mutation, zero RNG).
3. **Explainable Thai Utility Scoring (`ScoreAcc` / `S.add`):**
   - Every utility term in `js/ai.js` and `js/cognition.js` pushes a human-readable Thai reason via `S.add('เหตุผลภาษาไทย', weight)` (recorded when `Math.abs(v) > 0.06`).
   - Top 4 reasons sorted by `Math.abs(weight)` are stored in `npc.why` (`[['เหตุผล', weight], ...]`) and `n.cognition.trace` (capped at 8) and displayed live on the HUD (`#selAct`) and NPC Mind tab.
4. **Station Reservation & Release Discipline (`js/ai.js` lines 67–88, 1396–1404):**
   - Every station reserved via `AI.reserve(W, n, st)` (`st.occ = n.id`, `n.act.st = st.id`, `b.inside.push(n.id)`) **must** be released via `AI.release(W, n)` (and `WILD_RES.releaseClaim(W, n)`) on completion, interruption (`AI.interruptFor`), cancellation (`AI.cancelAct`), retirement (`SIM.retire`), or death (`AI.kill`).

---

## 2. Tier 1: The 12-Layer Human Core (`js/human_core.js` — `g.HC`)

### 2.1 Key Layers & Parameter Paths (`HC.eff(n, path)`)
- **`personality` (14):** `ambition`, `discipline`, `loyalty`, `integrity`, `empathy`, `courage`, `caution`, `pride`, `aggression`, `curiosity`, `creativity`, `rationality`, `composure`, `trustfulness`.
- **`values` (8 — `VAL_IDS`):** `martialPeak`, `knowledgeCraft`, `sectDuty`, `familyClan`, `freedom`, `wealthResource`, `powerStatus`, `honorLegacy`.
  - Fulfilment tracked in `n.h.fulfil[valKey]` (`0..100`), decaying by `-0.0042/min` in `AI.needs` (`js/ai.js` lines 1529–1536) and replenished via `AI.vf(n, { [valKey]: delta })`.
- **`temperament`:** `sociability`, `sensationSeeking`, `optimism`, `humor`, `affection`, `emotionalReactivity`.
- **`interests` (24 — `INT_IDS`):** `combat`, `weapons`, `innerQi`, `meditation`, `scholarship`, `alchemy`, `forging`, `herbs`, `medicine`, `exploring`, `socializing`, `teaching`, `romance`, `arts`, `solitude`, `cuisine`, `worship`, `trade`, `labor`, `leading`, etc.
- **`physiology` (16):** `vitality`, `strength`, `toughness`, `agility`, `dexterity`, `reflex`, `explosiveness`, `endurance`, `constitution`, `recoveryRate`, `painTolerance`, `longevity`, etc.
- **`intellect` (18):** `comprehension`, `focus`, `memory`, `learningSpeed`, `planning`, `judgement`, `perceptiveness`, `readPeople`, `numeracy`, `tactics`, `spatial`, `wisdom`, `willpower`, etc.
- **`social` (7):** `charisma`, `persuasion`, `intimidation`, `teaching`, `leadership`, `deception`, `etiquette`.
- **`affinities` (23):** 8 Elemental affinities + 15 Weapon/Art affinities (`SWORD`, `BLADE`, `SPEAR`, `FIST_PALM`, `STAFF`, `BOW`, `THROWING`, `ALCHEMY`, `FORGING`, `ARRAY`, `TALISMAN`, `MEDICINE`, `SCRIPTURE`, `BEAST`, `PUPPET`, `SOUL_DIVINE`, `BODY_REFINING`, `MOVEMENT`, `POISON`).
  - **10-Weapon Affinity Mapping (`MC_AFF_MAP` in `js/ai.js` line 126):**
    `{ BOW: 'SWORD', STAFF: 'SPEAR', FOCUS: 'SOUL_DIVINE', ZITHER: 'SOUL_DIVINE', BRUSH: 'TALISMAN', WHIP: 'SPEAR' }` (maps newer weapon skill IDs onto locked `HC` affinity keys without touching `human_core.js`).
- **`state` (`n.h.state`):** `hp`, `qi`, `satiety` (`0..100`), `rest` (`0..100`), `energy` (`0..100`), `mood` (`-100..100`), `stress` (`0..100`), `social` (`0..100`), `loneliness` (`0..100`), `novelty` (`0..100`), `anger` (`0..100`), `fear` (`0..100`), `heartDemon` (`0..100`).

---

## 3. Tier 2: Goal-Driven Cognition & Sect Governance (`js/cognition.js` — `g.COG`)

### 3.1 Section 1: The 9 Long-Term Life Aspirations (`js/cognition.js` lines 34–204)
- **9 Archetypal Aspirations (`COG.ASPIRATIONS`):**
  1. `martial_master` (`บรรลุยอดยุทธ์และศาสตราคู่กาย`) — `prefGoals`: `['scripture', 'gear_upgrade', 'rival', 'breakthrough', 'investigate_clue']`. Scores `martialPeak`, `combat` interest/aptitude, `courage`, and highest of all **10 weapon skills** (`SWORD`, `BLADE`, `SPEAR`, `FIST_PALM`, `BOW`, `STAFF`, `FOCUS`, `ZITHER`, `BRUSH`, `WHIP`).
  2. `realm_ascendant` (`ก้าวข้ามขอบเขตบำเพ็ญสู่ขั้นสูง`) — `prefGoals`: `['breakthrough', 'scripture', 'craft', 'investigate_clue']`.
  3. `master_alchemist` (`เป็นปรมาจารย์ปรุงโอสถและสมุนไพร`) — `prefGoals`: `['craft', 'crisis', 'service', 'scripture', 'investigate_clue']`.
  4. `master_artificer` (`เป็นช่างหลอมศาสตราและค่ายกลชั้นครู`) — `prefGoals`: `['craft', 'gear_upgrade', 'service', 'crisis', 'investigate_clue']`.
  5. `benevolent_healer` (`เป็นหมอยาผู้เป็นที่พึ่งของศิษย์ร่วมสำนัก`) — `prefGoals`: `['help_friend', 'service', 'craft', 'crisis']`.
  6. `respected_mentor` (`เป็นอาจารย์ผู้สืบทอดวิชาและชี้แนะรุ่นหลัง`) — `prefGoals`: `['mentor_disciple', 'scripture', 'service', 'investigate_clue']`.
  7. `wealthy_trader` (`สร้างฐานะมั่งคั่งและสะสมทรัพยากรล้ำค่า`) — `prefGoals`: `['gear_upgrade', 'craft', 'scripture']`.
  8. `sect_pillar` (`เป็นเสาหลักบริหารและค้ำจุนสำนัก`) — `prefGoals`: `['service', 'crisis', 'mentor_disciple', 'breakthrough']`.
  9. `peaceful_companion` (`ใช้ชีวิตสงบสุขเคียงข้างมิตรสหาย`) — `prefGoals`: `['social_bond', 'help_friend', 'craft']`.
- **Bounded Hysteresis (`COG.ensureAspiration` lines 149–194):**
  - Evaluated at most once every 30 days (`day - c.aspiration.lastReviewDay >= 30`).
  - Only switches aspiration if held `>= 45` days (or promoted from `'member'` to an officeholder with `top.id === 'sect_pillar'`) AND `top.score > curScoreObj.score + 18`.
  - Matching `prefGoals` receive a **`+0.38` weight boost** during goal selection (`line 1192`).
  - Completing any genuine non-recovery goal (`isGenuineGoalSuccess`) advances `asp.progress` by `+12%` and records a milestone in `asp.milestones` (capped at `8`, `COG.recordAspirationMilestone`).

### 3.2 Section 2: NPC office and role definitions (`COG.OFFICE`), Jurisdiction & Automatic Delegation (`lines 9–29, 209–330`)
- **24 role keys in `COG.OFFICE`:**
  `commander`, `provision`, `herbal`, `wildwarden`, `steward`, `master`, `deputy`, `martial`, `alchemy`, `forge`, `scripture`, `discipline`, `treasury`, `mission`, `guard`, `registry`, `healer`, `disciples`, `envoy`, `spymaster`, `beastmaster`, `arraymaster`, `censor`, `quartermaster`. The fallback role `'member'` is not a key in this object; the sect post registry is a separate list.
  - Per-tick role lookup is cached on `n._cogRoleCache` (`lines 213–248`).
- **Automatic Delegation When Unavailable (`COG.syncOfficeAuthority(W)` lines 263–330):**
  - Checked daily and during `COG.reviewOffices(W)`.
  - If an appointed officeholder (`W.sect.posts[post]`) is temporarily unavailable (`!COG.available(holder, W)`: `away`, `sealed`, `sealedBt`, `jail`, `punished`), `COG.syncOfficeAuthority` delegates authority in `W.sect.delegations[post] = { post, holderId, delegateId, since: W.t, until: W.t + 1440, reason }` to the highest-scoring available assistant (`x.assist === post`), deputy, or rank `>= 2` disciple with `SECT.relevance(post, x) >= 24`.
  - When the original holder becomes available again, `W.sect.delegations[post]` is automatically cleared (`line 301`).
  - **Authority Guardrail (`COG.performDuty` line 2170):** An ordinary assistant (`r.acting && !r.delegated`) helps in the hall but **cannot** overwrite official hall production orders (`W.sect.orders`).

### 3.3 Section 3: Bounded Non-Omniscient Perception & Heuristic Forecasting (`lines 335–505`)
- **Role-Scoped Knowledge (`COG.knowledgeScope(W, n)` lines 349–363):**
  - `canSeeFullTreasury`: only `['master', 'deputy', 'treasury', 'discipline']`.
  - `canSeeAuditEvidence`: only `['master', 'deputy', 'discipline']`.
  - `canSeeApplicantCA`: only `['master', 'deputy', 'registry']`.
  - `canSeeHiddenPA: false` — **Hard Invariant:** No NPC ever sees hidden Potential Ability (PA).
- **180-Tick Library Discovery Lag (`COG.isAwareOf` lines 374–395):**
  - When a technique is added to `W.sect.library` (`COG.recordHallAddition(W, 'library', itemId, actorId)`), other disciples do not magically know about it for `180` ticks unless they are `'scripture'`, `'master'`, `'deputy'`, the `actorId` who donated it, or currently performing `['study', 'guidedStudy', 'donate', 'duty', 'shop']`.
- **Zero-RNG Heuristic Forecasting (`COG.forecast(W, n, kind, target)` lines 425–505):**
  - `'affordability'`: Estimates `daysNeeded = deficit / dailyNet` to afford a manual or shop gear (`ok: daysNeeded <= 28`).
  - `'huntRisk'`: Estimates `winProb` against a beast using `ownPower / (ownPower + bPower)`, shifted by `(courage - caution) * 0.08` and 14-day decaying zone memories (`'hunt_loss'` / `'hunt_win'`).
  - `'invitation'`: Estimates `acceptProb` for social invitations from affection, trust, gratitude, and partner's current activity.
  - `'reserves'`: Estimates sect `foodDays` and `stoneMonths` (`shortageRisk: foodDays < 7 || stoneMonths < 1.5`).

### 3.4 Section 4: Technique Preference, Loadout Reconciliation, Build Improvisation & Gear Upgrades (`lines 510–821`)
- **Technique Preference (`COG.techPreference(n, t)` lines 512–605):**
  - Cached via `TP_CACHE` (`WeakMap` keyed by `n._ver`, `_mVer`, `stage`, `sub`, `path`, `techs.length`, `post`, `eqW`, `eqA`, `_passVer`, `pets.length`).
  - Evaluates weapon/armor match (`M.conditionMatches`: `+0.8` or `-1.8` if missing required weapon), open passive slots (`+1.45`), passive family redundancy (`-1.25` if same family at `>= tier` is already active), combat archetype fit (`SK.profile(t).arch` vs `caution`, `aggression`, `empathy`), multi-move depth (`t.moveDefs.length`), elemental compatibility (`ELEM.resolveCompatibility`), subpath/weapon profile fit (`M.PROFILES[n.cult.sub][3]`), and active Spirit Beast role synergy (`IRON_GUARDIAN`, `FEROCIOUS_ASSAULT`, `VENOM_SWARM`, `MYSTIC_SUPPORT`: `+0.28`).
- **Passive Loadout Reconciliation (`COG.reconcileLoadout(W, n)` lines 646–679):**
  - Preserves player-pinned passives (`n.passivePinned`) and excludes `n.passiveUnequipped`, deduplicates by `M.passiveFamilyOf(t)`, fills up to `M.maxPassiveSlots(n)`, and syncs resource caps (`M.syncResourceCaps(n)`).
- **Build Improvisation (`COG.evaluateBuildImprovisation(W, n)` lines 682–779):**
  - Pure zero-RNG evaluator checking if the NPC holds their subpath's preferred weapon (`M.PROFILES[c.sub][3]`, covering all 10 weapon types including `ZITHER`, `BRUSH`, `WHIP`) and matching elemental manuals:
  - Returns `mode`: `'optimal'` | `'upgrade_to_preferred'` | `'improvise_weapon'` | `'improvise_craft_weapon'` | `'improvise_unarmed'` | `'improvise_manual'`, along with `summaryTh`, `reasons`, and `targetActions`.
- **Resonance-Aware Gear Upgrade (`COG.bestGearUpgrade(W, n)` lines 782–821):**
  - Hysteresis cooldown: `180` ticks if currently holding a fallback weapon (`curWpnIsFallback`), else `720` ticks (`n._lastGearSwapAt`).
  - Checks personal bag (`n.inv.gear`) first (free), then sect armory/shop (`W.sect.gear`), adding **`+45` (3-piece) or `+22` (2-piece)** when an item completes an Equipment Resonance Set or Legendary Relic Set (`M.resonanceUpgradePreview`).

### 3.5 Section 5: 13 Multi-Horizon Goals, Emergency Suspension & True Progress (`lines 826–1630`)
- **13 Goal Types (`c.goal.id`):**
  1. `recovery` (`พักรักษาตัวและฟื้นฟูกำลัง` — emergency override when `!safe(n)`).
  2. `service` (`ปฏิบัติงานในหน้าที่และกำกับดูแลหอ` — for officeholders).
  3. `crisis` (`เร่งผลิต/จัดหาของที่สำนักขาดแคลน` — responds to critical `W.sect.shortageDirectives`).
  4. `help_friend` (`นำโอสถไปมอบให้สหายที่บาดเจ็บ` — triggered when `empathy >= 48` and a friend has `hp < 55%`).
  5. `investigate_clue` (`สืบค้นและคลี่คลายเบาะแส` — links to `VC.pickActionableClueForNpc`, actions: `['investigateClueLocal', 'meetVisitor', 'practice', 'study', 'cultivate']`).
  6. `mentor_disciple` (`ชี้แนะเคล็ดวิชาและทักษะให้ศิษย์/รุ่นน้อง` — for `rank >= 3` with `social.teaching >= 42`).
  7. `social_bond` (`กระชับมิตรไมตรีกับสหาย` — for `peaceful_companion`).
  8. `breakthrough` (`เตรียมตัวก้าวข้ามขอบเขต` — decomposes into `prepare_body`, `consolidate_gate`, `seclude`, or `accumulate_qi`).
  9. `track_bottleneck` (`แก้คอขวดสายเฉพาะทาง` — delegates to `CULT.inspectProgressionBottleneck(W, n)` for 9-Realm Track skill/stone gates).
  10. `scripture` (`ตั้งใจเรียนคัมภีร์` — decomposes into `seek_access`, `earn_cp`, or `study`).
  11. `gear_upgrade` (`จัดหาอุปกรณ์คู่กาย` — decomposes into `equip_gear`, `earn_cp`, `buy_gear`, or `craft_or_wait`).
  12. `craft` (`เก็บส่วนผสมเพื่อปรุงโอสถ/หลอมศาสตรา` — decomposes into `brew`, `hall_craft`, or `gather_input`).
  13. `rival` (`ฝึกฝนเพื่อก้าวข้ามคู่แข่ง/ศัตรู` — until `CULT.power(n) > CULT.power(rival) * 1.15`).
- **Auto-Bag Consumption in `COG.prepare` (`lines 1069–1118`):**
  - Automatically consumes compatible Subpath Insight Crystals (`MARTIAL.useCrystal` when `knowledgeFit >= 48`), reads eligible personal technique manuals (`SECT.EDITOR.usePersonalItem`), and equips `'useful-now'` personal bag gear (`SECT.EDITOR.equipPersonalGear`) when safe and not in combat.
- **Emergency Goal Suspension & Resumption (`COG.prepare` lines 1120–1170):**
  - If `!safe(n)` (`hp / hpMax < 0.35 || satiety < 20 || rest < 8`) while holding a non-recovery goal, saves the goal to `c.suspendedGoal` and switches `c.goal` to `'recovery'`.
  - Once `'recovery'` completes and `safe(n)` is true, restores `c.suspendedGoal` with its `expiresAt` extended by `pausedDur`.
- **True Progress Verification (`COG.doesActionAdvanceGoal` lines 1548–1616):**
  - `COG.finished(W, n, actId)` only updates `c.goal.lastProgress = W.t` if `COG.doesActionAdvanceGoal` confirms real state progress against `goal.progressSnap`.

### 3.6 Sections 6–8: Modifiers, Relationships, Mentoring, Altruism, Flattery & Office Politics (`lines 1327–2257`)
- **Single-Object Per-Tick Modifier Cache (`n._cogModCtx` lines 1336–1423):**
  - `COG.modifiers(W, n, id, SAcc)` caches role duties, goal actions, office plans (`W.sect.officePlans`), office orders (`W.sect.officeOrders`), track bottleneck windows, and catalyst refinement readiness (`hasRefineCand`) once per decision tick on `n._cogModCtx`.
- **7-Dimensional Relationships (`COG.relInfo` & `COG.deferenceToward` lines 1662–1707):**
  - Tracks `affection` (`a`), `trust` (`t`), `respect` (`r`), `love` (`l`), `rivalry` (`v`), `gratitude` (`g`), `fear` (`f`), `memResent`, and `deference` (`0..100` with Thai summary `summaryTh`).
- **Commitments & Concrete Mentoring (`lines 1710–1806`):**
  - `COG.startCommitment` / `COG.resolveCommitment` tracks pair invitations and oaths; broken commitments without emergency excuse (`raid`, `inj`, `!safe`) penalize `trust - 3` and record `'broken_commitment'`.
  - `COG.completeMentorLesson` practices the target skill AND directly boosts `student.cult.learning.got` by `14% * teachQuality/2` (or grants shared technique mastery via `SK.gainMastery`).
- **Altruism (`A.shareMedicine` & `A.giftItem` lines 1809–1932):**
  - `A.shareMedicine` delivers personal recovery pills to injured nearby friends (`hp < 55%`, `distance <= 12`), boosting `gratitude + 12`, `trust + 3`, `affection + 2`.
  - `A.giftItem` gifts `'gift-worthy'` surplus personal bag gear to compatible friends/disciples/spouses (`gratitude + 16`, `affection + 5`, `trust + 4`, 7-day cooldown).
- **Non-Omniscient Flattery (`A.flatter` & `COG.executeFlattery` lines 1937–2021):**
  - Ambitious/manipulative NPCs (`motive >= 14`) approach higher-rank officers. Target judges via `discern` (`readPeople`, `judgement`, `integrity`, `recentRepeat * 14` vs `pride`, `trustfulness`), yielding `'distrusted'` (`trust - 4`, `favor - 6`), `'welcomed'` (`affection + 3`, `favor + 5` capped at `+18`), or `'ignored'`.
- **Sect-Wide Weapon-Need Forge Bias (`COG.orderBias` lines 2065–2087):**
  - Builds a daily cached map (`W._wpnNeedMap`, keyed by `W._wpnNeedDay === W.day`) of how many disciples lack their subpath's preferred weapon (`M.PROFILES[m.cult.sub][3]`), boosting matching forge recipe selection by `+min(0.42, needCount * 0.16)`.
- **Treasury Embezzlement & Discipline Investigation (`COG.performDuty` lines 2185–2223):**
  - A low-integrity, high-greed Treasurer (`integrity < 36 && greed > 65`) may skim `8..45` Spirit Stones (`W.sect.suspicion += 5`, logged in `W.sect.auditTrail`).
  - The Discipline Elder (`r.id === 'discipline'`) investigates when `suspicion > 0`, calling `SECT.exposeEmbezzle(W, tre, n)` if `integrity >= 45 || relBias < 25`, or delaying investigation if biased toward a close friend.

---

## 4. Tier 3: Minute-by-Minute Psychological Utility AI (`js/ai.js` — `g.AI`)

### 4.1 Complete Cross-Module `AI.ACTS` Catalog (42 Actions)
| Module | Registered Action IDs (`AI.ACTS.<id>`) |
| :--- | :--- |
| **Core (`js/ai.js`)** | `sleep`, `eat`, `cultivate`, `breakthrough`, `practice`, `study`, `brew`, `forge`, `farm`, `mine`, `cook`, `duty`, `guard`, `heal`, `supportBless`, `pray`, `leisure`, `shop`, `errand`, `festival`, `idle`, `sentence`, `hide`, `pair` (24) |
| **Cognition (`js/cognition.js`)** | `shareMedicine`, `giftItem`, `flatter` (3) |
| **CP Economy (`js/cpeco.js`)** | `forage`, `brewBasic`, `donate`, `personalPillDonation`, `personalBrew`, `personalPillUse`, `paidTraining`, `guidedStudy` (8) |
| **Bottleneck & Track (`js/bottleneck.js`)**| `consolidate`, `skillDrill`, `specialize` (3) |
| **Retraining (`js/retraining.js`)** | `retrain` (1) |
| **Visitors & Clues (`js/visitors_clues.js`)**| `meetVisitor`, `investigateClueLocal` (2) |
| **Wildlife & Ecology (`js/wildlife.js`, `js/wild_resources.js`)** | `wildHunt`, `gatherWildResource` (2) |
| **External Market (`js/external_market.js`)**| `outsideTrade` (1) |

### 4.2 12-Path Cultivation Routing & Per-Tick Training (`A.cultivate` in `js/ai.js` lines 229–445)
`A.cultivate` routes each of the **12 Major Cultivation Paths** to its thematic sect stations and trains path-specific skills/attributes every 20–30 ticks:
- `XIAN`: `meditation_hall` (`meditate`) → trains `focus` + `wisdom`.
- `BODY`: `training_ground` (`lift`/`dummy`) → trains `strength`, `toughness`, `endurance`.
- `GOD`: `shrine` (`worship`) → trains `focus` + `wisdom`.
- `DEMON`: `ruin` (`explore`, `1.45×`) / `meditation_hall` → practices `POISON`/`stealth`/`SOUL_DIVINE`, trains `willpower` + `explosiveness`, accumulates `heartDemon` (`+0.35/hr`, backlash risk at `>= 78`).
- `HEART_SOUL`: `meditation_hall` (`1.55×`) / `spirit_pond` / `tea_garden` → reduces `heartDemon` (`-0.035/min`), practices `arts`/`SOUL_DIVINE`, trains `focus` + `comprehension` + `wisdom`.
- `MECH_PUPPET`: `forge` (`anvil`/`array`, `1.42×`) → cools `mechState.heat`, charges `mechState.charge`, repairs `mechState.integrity`, practices `FORGING` + `dexterity`.
- `KARMA_SAMSARA`: `meditation_hall` / `shrine` / `ancestral` (`1.48×`) → reduces `heartDemon`, practices `SCRIPTURE` + `wisdom`.
- `BEAST_SOVEREIGN`: `spirit_pond` / `herb_garden` / `training_ground` (`1.42×`) → practices `BEAST_TAMING`, restores active pets' `fatigue`, `hp`, and `bond`/`loyalty`.
- `SAGE_SUPPORT`: `tea_garden` / `herb_garden` / `meditation_hall` (`1.48×`) → reduces `heartDemon` & `stress`, practices `MEDICINE` + `wisdom`.
- `CRAFT_CREATION`: `alchemy` (`cauldron`) or `forge` (`anvil`/`array`, `1.52×`) → reduces `heartDemon`, practices `ALCHEMY` / `FORGING` / `ARRAY` + `dexterity` + `wisdom`.
- `ARRAY_TALISMAN`: `forge` (`array`) / `meditation_hall` / `scripture` (`1.50×`) → reduces `heartDemon`, practices `TALISMAN` / `ARRAY` + `comprehension` + `wisdom`.
- `STRATEGY_GOVERNANCE`: `scripture` (`read`) / `main_hall` (`work`) / `meditation_hall` (`1.50×`) → reduces `heartDemon`, practices `SCRIPTURE` + `administration` + `planning` + `wisdom`.

### 4.3 Active Technique Retention Guard, Direct Mentorship & Dying-Wish Qi Transmission (`js/ai.js`)
- **Active Technique Retention Guard (`AI.nextTechToStudy` & `A.study.tick` lines 570, 584–616):**
  - When known active techniques reach `CULT.maxTechs(n)`, `AI.nextTechToStudy` computes `minReplaceScore` among replaceable (non-`legendary`, non-`isSectHeritage`) active techniques via `CULT.techRetentionScore(n, x)` and only selects a new active technique if `techRetentionScore(n, t) > minReplaceScore + 15`.
  - When `A.study` finishes learning a technique (`line 570`), `CULT.pruneExcessActiveTechs(n)` prunes the lowest-scoring replaceable active technique while strictly protecting `legendary`, `isSectHeritage`, and `innateOnly` arts (`score = 1e9`).
- **Breakthrough Mentor & Imprint Bonus (`A.breakthrough.done` line 476):**
  - `guide = (mId && W.byId[mId] && !W.byId[mId].dead ? 0.05 : 0) + (n.mentorImprint ? 0.04 : 0)` adds up to **`+9%` breakthrough success chance** when guided by a living mentor AND carrying a `mentorImprint`.
- **Direct Mentorship Coaching (`AI.updateBond`, `AI.socialStart`, `AI.pairEnd` lines 1167, 1221, 1325–1330):**
  - `AI.updateBond` labels `n.mentorId` / `n.apprenticeIds` as `'อาจารย์สายตรง'` / `'ศิษย์สายตรง'`.
  - Completing a `'teach'` pair interaction invokes `SECT.MENTORSHIP.coachDisciple(W, a, b)` (granting cultivation progress and skill practice, reducing heart demon by 5 and stress by 6, and applying `mentorGuidance`). See `progression-design` for the current formula.
- **Dying-Wish Qi Transmission (`AI.kill` lines 1358–1361):**
  - The death path can invoke `SECT.MENTORSHIP.transmitQi(W, n, appId, { dyingWish: true, force: true })` for a living apprentice. Transmission uses the disciple's threshold and mentor's equivalent stage, selects the first eligible non-innate unknown technique in the mentor's list, and writes `mentorImprint`; see the implementation for conditions and details.

### 4.4 Decision Pipeline, Protected Actions & Needs (`js/ai.js` lines 1185–1601)
1. **`AI.decide(W, n)` (`lines 1422–1475`):**
   - Calls `COG.prepare(W, n)`.
   - Scores all eligible `AI.ACTS` via `a.score(n, W, S)` + `COG.modifiers(W, n, id, S)` + repetition penalty (or `+0.24` `'ทำต่อเนื่องให้สำเร็จ'` if `COG.isContinuingProductiveWork(W, n, id)` is true).
   - Softmax-orders the top 6 candidates with `temp = COG.choiceTemperature(n)` (`0.06..0.40`), plus up to 2 fallback candidates (`u > -0.5`) if all top-6 stations are occupied.
   - If `a.where(W, n)` returns `null`, records `COG.blocked(W, n, c.id)` and `SECT.recordFacilityDemand(W, c.id, 'failed_station', n)`.
2. **`AI.PROTECTED_ACTS` (`line 1185`):**
   - `sleep`, `eat`, `heal`, `supportBless`, `breakthrough`, `fight`, `sentence`, `hide`, `pair`, `brew`, `forge`, `cook`, `brewBasic`, `personalBrew`, `paidTraining`, `guidedStudy`, `retrain`, `specialize`, `wildHunt`, `guard` (plus `duty` and `study >= 65%`) cannot be interrupted by social `pair` invitations.
3. **Stage-Scaled Meditation Rest Recovery (`AI.needs` lines 1515–1525):**
   - When `id === 'cultivate'` and `eqStage > 0`, cultivation **recovers** `s.rest` (`(0.025 + eqStage * 0.02) * (0.8 + focus / 250)`) and `s.energy` (`0.02 + eqStage * 0.01`) instead of draining rest.

---

## 5. How to Add or Extend an AI Action / Goal Safely (Step-by-Step Template)

```javascript
A.myNewAction = {
  nameTh: 'ชื่อกิจกรรมภาษาไทย', icon: '✨', color: '#6ddfb5', cooldown: 120,
  can: (n, W) => !!(n.cult && n.h.state.energy > 30 && n.h.state.satiety > 25 && !(n.inj && n.inj.some(i => i.sev >= 2))),
  score(n, W, S) {
    S.add('เหตุผลหลักภาษาไทย', 0.65 + (E(n, 'personality.discipline') - 50) / 200);
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
1. If the action advances a `COG` goal, add its ID to `computeGoalStep` (`js/cognition.js` lines 876–986), `COG.modifiers` (`lines 1347–1365`), and `COG.doesActionAdvanceGoal` (`lines 1548–1616`).
2. If the action should not be interrupted by social `pair` invites, add its ID to `AI.PROTECTED_ACTS` (`js/ai.js` line 1185).

---

## 6. Mandatory AI & Cognition Verification Suites
Run from `GAME_SOURCE/`:
```bash
node test/core_lock.js
node test/npc_cognition.js
node test/npc_offices.js
node test/npc_command.js
node test/npc_social_help.js
node test/npc_life_authority_overhaul.js
node test/v212_weapon_build_improvisation_suite.js
node test/codex_combined_review.js
```
