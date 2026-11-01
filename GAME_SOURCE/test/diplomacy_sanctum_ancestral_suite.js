'use strict';
const assert = require('node:assert/strict');
const { SIM, SECT, EXPLORE, CULT, MARTIAL: M, AI, COG, ECO, CONTENT, SK, COMBAT, VC, JD, STATS, UI, HC } = require('./load.js');

console.log('=== Running Next Patch Integration, NPC Decisions & Progression Validation Suite ===');

// ============================================================================
// AREA 1: NPC Decisions, Progression Bottlenecks (MOVEMENT 15 -> 30),
//         Unavailable Resources/Stations/Teachers, Variation & Multi-Seed Sim
// ============================================================================
{
  const W = SIM.create('area1-movement-bottleneck');
  const n = W.npcs.find(x => x && !x.dead && x.cult && x.id !== W.sect.masterId) || W.npcs[1];
  n.cult.path = 'DEMON';
  n.cult.stage = 3;
  n.cult.sub = 'SHADOW_ASSASSIN'; // ordinal 1 -> 2 requires MOVEMENT 30, stealth 10
  n.cult.track = CULT.initTrack('SHADOW_ASSASSIN', 1, W.day);
  const trTh = CULT.trackThreshold(n);
  n.cult.track.prog = trTh; // Ready on progress (200/200)
  n.inv.stones = 500; // Stones gate satisfied
  M.skillSet(n, 'MOVEMENT', 15);
  M.skillSet(n, 'stealth', 25); // Secondary gate already satisfied
  M.skillSet(n, 'SWORD', 45); // High unrelated weapon skill to ensure practice doesn't train SWORD instead of MOVEMENT!
  n.h.state.hp = CULT.hpMax(n);
  n.h.state.satiety = 85;
  n.h.state.rest = 85;
  n.h.state.energy = 90;
  n.inj = [];

  // 1a. Distant future requirements ignored when prog < 0.65 * trTh
  n.cult.track.prog = Math.floor(trTh * 0.3);
  assert.equal(M.activeBottleneckSkills(W, n).length, 0, 'Below 65% threshold, future realm skill gates must not be active bottlenecks');
  assert.equal(CULT.inspectProgressionBottleneck(W, n).active, false, 'Below 65% threshold, progression bottleneck must not activate');

  // 1b. At specialization breakthrough (prog = trTh), NPC identifies MOVEMENT 15/30
  n.cult.track.prog = trTh;
  const bn = CULT.inspectProgressionBottleneck(W, n);
  assert.equal(bn.active, true, 'Bottleneck must be active at threshold');
  assert.equal(bn.kind, 'track');
  assert.equal(bn.track.primarySkillToTrain, 'MOVEMENT', 'Primary missing skill must be identified as MOVEMENT');
  assert.equal(bn.track.missingSkills.length, 1, 'Only the unmet MOVEMENT requirement should be listed');
  assert.equal(bn.track.missingSkills[0].skill, 'MOVEMENT');
  assert.equal(bn.track.missingSkills[0].current, 15);
  assert.equal(bn.track.missingSkills[0].required, 30);
  assert(bn.feasibleActions.includes('skillDrill') && bn.feasibleActions.includes('practice'), 'skillDrill and practice must be feasible when training stations are free');

  // Verify practice.where and skillDrill.where both select MOVEMENT (not SWORD!)
  const pracW = AI.ACTS.practice.where(W, n);
  const drillW = AI.ACTS.skillDrill.where(W, n);
  assert.equal(pracW.skill, 'MOVEMENT', 'practice.where must select MOVEMENT for bottleneck resolution, not SWORD');
  assert.equal(drillW.skill, 'MOVEMENT', 'skillDrill.where must select MOVEMENT for bottleneck resolution');

  // 1c. Unavailable stations & teachers: explain when progress is genuinely impossible
  const savedOcc = W.map.stations.map(s => s.occ);
  W.map.stations.forEach(s => { if (s.bkey === 'training_ground' || s.bkey === 'scripture') s.occ = 'OCCUPIED_TEST'; });
  W.npcs.forEach(o => { if (o !== n && o.h && o.h.skills) o.h.skills.MOVEMENT = 5; }); // No qualified teacher
  W.t += 1;
  const bnBlocked = CULT.inspectProgressionBottleneck(W, n);
  assert.equal(bnBlocked.impossible, true, 'When all stations and teachers are unavailable, bottleneck must report impossible=true');
  assert.equal(bnBlocked.feasibleActions.length, 0, 'No feasible bottleneck actions when all stations and teachers are unavailable');
  assert(bnBlocked.blockerReasonTh && bnBlocked.blockerReasonTh.length > 0, 'Must provide a human-readable blocker explanation');
  COG.prepare(W, n);
  if (n.cognition.goal && n.cognition.goal.id === 'track_bottleneck') {
    assert.equal(n.cognition.goal.step, 'blocked_impossible', 'Goal step must reflect blocked_impossible rather than pushing impossible actions');
    assert.equal(n.cognition.goal.status, 'blocked_prereq');
  }
  // Restore stations
  W.map.stations.forEach((s, i) => { s.occ = savedOcc[i]; });

  // 1d. Teacher seeking (seek_teach / pair) when senior teacher has high MOVEMENT
  const teacher = W.npcs.find(o => o && !o.dead && o !== n && o.cult);
  teacher.rank = 4;
  n.rank = 1;
  M.skillSet(teacher, 'MOVEMENT', 65);
  teacher.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] };
  teacher.away = false; teacher.sealed = false; teacher.jail = 0;
  W.t += 1;
  const bnWithTeacher = CULT.inspectProgressionBottleneck(W, n);
  assert(bnWithTeacher.feasibleActions.includes('pair'), 'pair must be feasible when a qualified teacher and training stations are available');
  const prevMove = M.skillRead(n, 'MOVEMENT');
  const savedRngNext = W.rng.next; W.rng.next = () => 0.1;
  const paired = AI.proposePair(W, teacher, n, 'teach', 'MOVEMENT');
  W.rng.next = savedRngNext;
  assert.equal(paired, true, 'proposePair for seek_teach must succeed when teacher is available');
  assert.equal(teacher.act.id, 'pair');
  assert.equal(n.act.id, 'pair');
  teacher.act.stage = 'do'; n.act.stage = 'do';
  for (let i = 0; i < 60; i++) AI.pairTick(W, teacher);
  assert(M.skillRead(n, 'MOVEMENT') > prevMove, 'Teaching pairTick must actually increase student MOVEMENT skill');
  AI.cancelAct(W, teacher);
  AI.cancelAct(W, n);

  // 1e. Emergency preemption: injured/starving NPC prioritizes survival over bottleneck training
  n.h.state.hp = Math.floor(CULT.hpMax(n) * 0.25);
  n.inj = [{ part: 'อก', why: 'บอบช้ำ', sev: 2, until: W.t + 500 }];
  W.t += 1;
  COG.prepare(W, n);
  assert.equal(n.cognition.goal.id, 'recovery', 'Severe injury / low HP must suspend bottleneck goal for emergency recovery');
  n.h.state.hp = CULT.hpMax(n);
  n.inj = [];
  W.t += 1;
  COG.prepare(W, n);

  // 1f. Personality & role variation: ambitious martial cultivator vs relaxed freedom NPC vs duty officer
  const ambNpc = W.npcs[2], relaxNpc = W.npcs[0];
  ambNpc.h.personality.ambition = 90; ambNpc.h.values.martialPeak = 90; ambNpc.h.personality.discipline = 85; ambNpc.h.values.freedom = 25;
  relaxNpc.h.personality.ambition = 20; relaxNpc.h.values.martialPeak = 20; relaxNpc.h.personality.discipline = 25; relaxNpc.h.values.freedom = 90;
  HC.bump(ambNpc); HC.bump(relaxNpc);
  assert(M.bottleneckSkillDrive(ambNpc) > M.bottleneckSkillDrive(relaxNpc) * 2.2, 'Ambitious cultivator must have substantially higher bottleneck training drive than relaxed NPC');

  // 1g. Train MOVEMENT from current value up to 30 through feasible actions and verify automatic advancement to ordinal 2
  n.cool = {};
  n.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] };
  while (M.skillRead(n, 'MOVEMENT') < 30) {
    W.t += 1;
    const w = AI.ACTS.skillDrill.where(W, n) || AI.ACTS.practice.where(W, n);
    assert.equal(w.skill, 'MOVEMENT', 'Selected drill/practice skill must remain MOVEMENT until 30 is reached');
    for (let tick = 0; tick < 100 && M.skillRead(n, 'MOVEMENT') < 30; tick++) {
      AI.ACTS.skillDrill.tick(n, W, w);
      n.h.state.energy = 90;
    }
    if (M.skillRead(n, 'MOVEMENT') >= 30) {
      W.rng.next = () => 0.01; // deterministic breakthrough success once gate is met
      AI.ACTS.skillDrill.done(n, W, w);
    }
  }
  assert(M.skillRead(n, 'MOVEMENT') >= 30, 'NPC must reach MOVEMENT >= 30');
  assert.equal(n.cult.track.ordinal, 2, 'NPC must advance from specialization ordinal 1 to ordinal 2 once MOVEMENT >= 30 and gates are met');
  console.log('  PASS Area 1: MOVEMENT 15->30 bottleneck detection, targeted training, teacher pairing, impossibility explanation, and advancement verified');
}

// ============================================================================
// AREA 2a: Diplomacy Lifecycle (Treaties, Exchanges, Cooldowns, Rival Envoys, Save/Load)
// ============================================================================
{
  const W = SIM.create('area2a-diplomacy-lifecycle');
  const master = W.byId[W.sect.masterId];
  const sect = W.world.sects[0];
  W.sect.stones = 5000;
  sect.attitude = 10;
  sect.treaty = 'NONE';

  // Failure condition 1: Invalid treaty type
  assert.equal(CONTENT.signTreaty(W, sect, 'NON_EXISTENT_TREATY').ok, false);
  // Failure condition 2: Insufficient attitude for ALLIANCE (needs 45)
  const failAtt = CONTENT.signTreaty(W, sect, 'ALLIANCE');
  assert.equal(failAtt.ok, false);
  assert.equal(failAtt.reason, 'insufficient-attitude');
  // Failure condition 3: Exchange when not allied and attitude < 30
  const failNotAllied = CONTENT.exchangeWithAlly(W, sect);
  assert.equal(failNotAllied.ok, false);
  assert.equal(failNotAllied.reason, 'not-allied');

  // Master decision entry point signs TRADE_CARAVAN_ACCORD when attitude >= 18
  sect.attitude = 30;
  for (const key of ['banquet','tournament','seclusion','upgrade','research','drive','discipleOf','audit']) W.sect.cd[key] = W.day + 100;
  W.sect.cd.diplomacy = 0;
  W.rng.chance = () => true;
  W.rng.float = () => 0;
  SECT.masterDecision(W, master);
  assert.equal(sect.treaty, 'TRADE_CARAVAN_ACCORD', 'masterDecision must sign a feasible trade accord');

  // Cooldown on duplicate same-treaty signing
  const dupTreaty = CONTENT.signTreaty(W, sect, 'TRADE_CARAVAN_ACCORD');
  assert.equal(dupTreaty.ok, false);
  assert.equal(dupTreaty.reason, 'cooldown');

  // Insufficient stones failure on exchange
  const savedStones = W.sect.stones;
  W.sect.stones = 10;
  assert.equal(CONTENT.exchangeWithAlly(W, sect).reason, 'insufficient-stones');
  W.sect.stones = savedStones;

  // Successful allied exchange & 15-day cooldown enforcement
  W.sect.cd.diplomacy = 0;
  sect.lastCaravanDay = -99;
  const exch1 = CONTENT.exchangeWithAlly(W, sect);
  assert.equal(exch1.ok, true, 'Allied exchange must succeed when eligible');
  assert(W.sect.crystals[exch1.crystalKey] >= 1, 'Allied exchange must grant subpath crystal into sect crystals');
  const exchCooldown = CONTENT.exchangeWithAlly(W, sect);
  assert.equal(exchCooldown.ok, false, 'Immediate repeat exchange on same day must be blocked by cooldown');
  assert.equal(exchCooldown.reason, 'cooldown');

  // Rival envoy selection, dispatch, and challenge resolution (both explicit champ and auto-selected defender, win & loss)
  const rival = W.world.sects[1] || sect;
  rival.treaty = 'RIVAL_FEUD';
  rival.attitude = -40;
  const envWin = SECT.resolveRivalEnvoyChallenge(W, null, rival.id, { forceWin: true });
  assert(envWin && envWin.ok && envWin.won === true, 'Rival envoy challenge must auto-select a sect defender and resolve victory');
  const envCooldown = SECT.resolveRivalEnvoyChallenge(W, null, rival.id, { respectCooldown: true });
  assert.equal(envCooldown.ok, false, 'Rival envoy challenge must respect cooldown when requested');
  const attBeforeLoss = rival.attitude;
  const envLoss = SECT.resolveRivalEnvoyChallenge(W, master, rival, { forceWin: false });
  assert.equal(envLoss.won, false, 'Rival envoy defeat path must resolve cleanly');
  assert(rival.attitude < attBeforeLoss, 'Rival envoy defeat must worsen rival sect attitude');

  // Save/load round-trip preserves treaties, exchange cooldowns, crystals, and political events
  const loaded = SIM.deserialize(SIM.serialize(W));
  const loadedSect = loaded.world.sects.find(x => x.id === sect.id);
  assert.equal(loadedSect.treaty, 'TRADE_CARAVAN_ACCORD');
  assert.equal(loadedSect.lastCaravanDay, W.day);
  assert.equal(loaded.sect.crystals[exch1.crystalKey], W.sect.crystals[exch1.crystalKey]);
  assert(loaded.world.politics.events.some(e => e.kind === 'ENVOY_CHALLENGE'), 'Envoy challenge history must survive save/load');
  console.log('  PASS Area 2a: Diplomacy treaties, exchanges, cooldowns, rival envoy challenges, failure modes, and save/load verified');
}

// ============================================================================
// AREA 2b: Sanctums Lifecycle, Failure/Retreat, NPC Catalyst Refinement,
//          and New Bonus-Reward System (4%/8%/12% by Deepest Floor, Cap 1,
//          Weighted Rarity Ordering, Uniqueness Protection, Farming Economy)
// ============================================================================
{
  const W = SIM.create('area2b-sanctum-bonus-and-lifecycle');
  const party = W.npcs.filter(n => n && !n.dead && n.cult).slice(0, 3);

  // 2b.1 Verify chance table & rarity weight ordering
  assert.deepEqual(EXPLORE.SANCTUM_BONUS_CHANCE_BY_FLOOR, { 0: 0, 1: 0.04, 2: 0.08, 3: 0.12 });
  const tiers = EXPLORE.SANCTUM_BONUS_TIERS;
  for (let i = 1; i < tiers.length; i++) {
    assert(tiers[i].weight < tiers[i - 1].weight, `Sanctum bonus tier weight must strictly decrease as rarity increases (${tiers[i-1].id}=${tiers[i-1].weight} vs ${tiers[i].id}=${tiers[i].weight})`);
    assert(tiers[i].rarityRank > tiers[i - 1].rarityRank);
  }

  // 2b.2 Floor 0 failure/retreat: 0 catalysts, 0% bonus chance
  const exF0 = EXPLORE.departSanctum(W, party, 'SANCTUM_SWORD_ABYSS');
  exF0.forceFailFloor = 1;
  const outF0 = EXPLORE.resolveSanctum(W, exF0, party, { bonusRoll: 0.0001 });
  assert.equal(outF0.floorsCleared, 0);
  assert.equal(outF0.retreated, true);
  assert.equal(outF0.failedFloor, 1);
  assert.equal(Object.keys(outF0.catalysts).length, 0, 'Floor 1 defeat must grant 0 catalysts');
  assert.equal(outF0.bonusRoll.chance, 0);
  assert.equal(outF0.bonusRoll.triggered, false);
  assert.equal(outF0.bonusReward, null);
  assert(party.every(m => !m.away && m.expId === null), 'Retreating sanctum party members must return to sect properly');

  // 2b.3 Exact boundary tests for Floor 1 (4%), Floor 2 (8%), and Floor 3 (12%) + 1-bonus-per-run cap
  const boundaryCases = [
    { maxFloor: 1, failFloor: 2, chance: 0.04, passRoll: 0.0399, failRoll: 0.0400, expectedCats: 1 },
    { maxFloor: 2, failFloor: 3, chance: 0.08, passRoll: 0.0799, failRoll: 0.0800, expectedCats: 2 },
    { maxFloor: 3, failFloor: null, chance: 0.12, passRoll: 0.1199, failRoll: 0.1200, expectedCats: 3 }
  ];
  for (const bc of boundaryCases) {
    // Pass boundary (< chance)
    const exPass = EXPLORE.departSanctum(W, party, 'SANCTUM_SWORD_ABYSS');
    exPass.forceClear = true;
    if (bc.failFloor) exPass.forceFailFloor = bc.failFloor;
    const outPass = EXPLORE.resolveSanctum(W, exPass, party, { bonusRoll: bc.passRoll, tierRoll: 0.10 });
    assert.equal(outPass.floorsCleared, bc.maxFloor);
    assert.equal(Object.values(outPass.catalysts).reduce((a, b) => a + b, 0), bc.expectedCats, `Floor ${bc.maxFloor} clear must preserve guaranteed catalysts (${bc.expectedCats})`);
    assert.equal(outPass.bonusRoll.chance, bc.chance);
    assert.equal(outPass.bonusRoll.triggered, true, `Roll ${bc.passRoll} must trigger at Floor ${bc.maxFloor} (chance ${bc.chance})`);
    assert.equal(outPass.bonusRewards.length, 1, 'Must drop at most 1 bonus reward per expedition');
    assert(outPass.bonusReward && outPass.bonusReward.id);

    // Fail boundary (>= chance): still gets guaranteed catalysts, 0 bonus reward
    const exFail = EXPLORE.departSanctum(W, party, 'SANCTUM_SWORD_ABYSS');
    exFail.forceClear = true;
    if (bc.failFloor) exFail.forceFailFloor = bc.failFloor;
    const outFail = EXPLORE.resolveSanctum(W, exFail, party, { bonusRoll: bc.failRoll, tierRoll: 0.10 });
    assert.equal(outFail.floorsCleared, bc.maxFloor);
    assert.equal(Object.values(outFail.catalysts).reduce((a, b) => a + b, 0), bc.expectedCats, 'Guaranteed catalysts must still drop when bonus roll misses');
    assert.equal(outFail.bonusRoll.triggered, false, `Roll ${bc.failRoll} must NOT trigger at Floor ${bc.maxFloor} (chance ${bc.chance})`);
    assert.equal(outFail.bonusReward, null);
    assert.equal(outFail.bonusRewards.length, 0);
  }

  // 2b.4 Second weighted roll across all 5 rarity tiers & uniqueness protection for APEX_LEGENDARY
  // Verify APEX_LEGENDARY on Floor 2 downgrades to UNCOMMON_MANUAL (requires_floor_3)
  const exF2Leg = EXPLORE.departSanctum(W, party, 'SANCTUM_SWORD_ABYSS');
  exF2Leg.forceClear = true; exF2Leg.forceFailFloor = 3;
  const outF2Leg = EXPLORE.resolveSanctum(W, exF2Leg, party, { bonusRoll: 0.01, tierRoll: 0.995 });
  assert.equal(outF2Leg.bonusRoll.requestedTierId, 'APEX_LEGENDARY');
  assert.equal(outF2Leg.bonusRoll.fallbackUsed, 'requires_floor_3');
  assert.notEqual(outF2Leg.bonusReward.tierId, 'APEX_LEGENDARY', 'Floor 2 must never grant APEX_LEGENDARY');

  // Verify APEX_LEGENDARY on Floor 3 grants an unclaimed legendary once and never duplicates it
  const claimedLegs = new Set();
  for (let i = 0; i < 30; i++) {
    const exL = EXPLORE.departSanctum(W, party, 'SANCTUM_SWORD_ABYSS');
    exL.forceClear = true;
    const outL = EXPLORE.resolveSanctum(W, exL, party, { bonusRoll: 0.01, tierRoll: 0.995 });
    if (outL.bonusReward.legendary) {
      assert.equal(claimedLegs.has(outL.bonusReward.id), false, `Legendary ${outL.bonusReward.id} must never drop twice`);
      claimedLegs.add(outL.bonusReward.id);
    } else {
      assert.equal(outL.bonusRoll.fallbackUsed, 'all_legendaries_claimed', 'Once all 22 legendaries are claimed, APEX_LEGENDARY must safely downgrade');
    }
  }
  assert.equal(claimedLegs.size, 22, 'All 22 legendary manuals must be uniquely claimable with 0 duplicates');

  // 2b.5 NPC choice to refine T4-T6 gear with catalysts (even when a generic forge order exists!)
  const refiner = party[0];
  refiner.rank = 2; // Inner disciple (rank 2) who cleared sanctum
  const testGear = ECO.mintGear(ECO.recipeById.MP_REC_SWORD_4 || JD.ITEMS.recipes.find(r => r.outType === 'EQUIPMENT' && r.tier === 4), 1.10);
  testGear.tier = 4; testGear.q = 1.10;
  refiner.equip = refiner.equip || {};
  refiner.equip.WEAPON = testGear;
  W.sect.orders = W.sect.orders || {};
  W.sect.orders.forge = { rid: 'MP_REC_SWORD_1', why: 'คำสั่งทั่วไป' };
  const cand = ECO.findCatalystRefinementCandidate(W, refiner);
  assert(cand && cand.gear === testGear, 'Rank 2+ disciple with T4 gear must be eligible for catalyst refinement');
  const forgeWhere = AI.ACTS.forge.where(W, refiner);
  assert(forgeWhere && forgeWhere.catalystRefine === true, 'AI.ACTS.forge.where must prioritize catalyst refinement for equipped T4-T6 gear');
  AI.ACTS.forge.done(refiner, W, forgeWhere);
  assert(testGear.q > 1.10, 'NPC executing forge catalyst refinement must upgrade gear quality');

  // 2b.6 Repeated NPC Sanctum runs simulation (200 runs) + save/load
  const WSim = SIM.create('area2b-sanctum-200-runs');
  const simParty = WSim.npcs.filter(n => n && !n.dead && n.cult).slice(0, 3);
  let totalBonus = 0, legBonus = 0;
  for (let r = 0; r < 200; r++) {
    WSim.day = 1 + r;
    const exR = EXPLORE.departSanctum(WSim, simParty, 'SANCTUM_BLOOD_VAJRA');
    exR.forceClear = true;
    const outR = EXPLORE.resolveSanctum(WSim, exR, simParty);
    assert(outR.bonusRewards.length <= 1, 'Never more than 1 bonus reward per run');
    if (outR.bonusReward) {
      totalBonus++;
      if (outR.bonusReward.legendary) legBonus++;
    }
  }
  // Expected bonus hits in 200 Floor-3 runs at 12% is ~24 (accept 8..48 for deterministic RNG)
  assert(totalBonus >= 8 && totalBonus <= 48, `200 Floor-3 runs should produce ~12% bonus drops, got ${totalBonus}/200`);
  assert(legBonus <= 3, `Legendary bonus drops must remain ultra-rare in 200 runs, got ${legBonus}`);
  for (const [cKey, qty] of Object.entries(WSim.sect.crystals || {})) {
    if (cKey.startsWith('S:')) assert(qty <= 2, `Subpath crystal ${cKey} must not inflate beyond saturation cap 2 during repeat farming, got ${qty}`);
  }
  const simLoaded = SIM.deserialize(SIM.serialize(WSim));
  assert.deepEqual(simLoaded.sect.catalysts, WSim.sect.catalysts, 'Sanctum catalysts must survive save/load');
  assert.equal(simLoaded.explore.sanctums.bonusDrops, totalBonus, 'Sanctum bonus drop history must survive save/load');
  console.log(`  PASS Area 2b: Sanctum 4%/8%/12% depth bonus rolls, 1-per-run cap, rarity weights, uniqueness protection, retreat, NPC refinement, and 200-run economy verified (bonus=${totalBonus}/200, leg=${legBonus})`);
}

// ============================================================================
// AREA 2c: Ancestral Legacy Lifecycle (Elder Death -> Tablet -> Prayer ->
//          Active & Expired Blessing on Ordinary/Spec Breakthroughs & Study/GuidedStudy)
// ============================================================================
{
  const W = SIM.create('area2c-ancestral-lifecycle');
  const elder = W.npcs.find(n => n && !n.dead && n.rank >= 4 && n.cult) || W.npcs[0];
  elder.rank = 4;
  elder.cult.path = 'XIAN';
  elder.cult.sub = 'PURE_SWORD_SAINT';
  elder.cult.stage = 5;

  // Non-qualifying disciple death should NOT create a tablet
  const jr = W.npcs.find(n => n && !n.dead && n !== elder && n.id !== W.sect.masterId && n.rank <= 1);
  if (jr) {
    jr.rank = 1; if (jr.cult) { jr.cult.stage = 1; jr.cult.track = null; }
    const tabsBefore = SECT.ensureLegacyTablets(W).length;
    AI.kill(W, jr, 'ทดสอบศิษย์ชั้นผู้น้อย');
    assert.equal(SECT.ensureLegacyTablets(W).length, tabsBefore, 'Low-rank disciple death must not inscribe an ancestral tablet');
  }

  // Qualifying elder death via AI.kill inscribes tablet
  AI.kill(W, elder, 'สละชีพปกป้องสำนัก');
  const tablets = SECT.ensureLegacyTablets(W);
  const tab = tablets.find(t => t.npcId === elder.id);
  assert(tab, 'Qualifying elder death via AI.kill must inscribe a legacy tablet');

  // Disciple prays at shrine via AI.ACTS.pray.done
  const disc = W.npcs.find(n => n && !n.dead && n.cult);
  disc.cult.path = 'XIAN';
  disc.cult.sub = 'PURE_SWORD_SAINT';
  disc.cult.stage = 4;
  disc.cult.prog = CULT.threshold(disc);
  disc.cult.track = CULT.initTrack('PURE_SWORD_SAINT', 2, W.day);
  disc.cult.track.prog = CULT.trackThreshold(disc);
  M.skillSet(disc, 'SWORD', 50);
  M.skillSet(disc, 'MOVEMENT', 50);
  disc.inv.stones = 500;

  disc.h.state.heartDemon = 0;
  const baseOrdBt = CULT.breakthroughChance(disc, { now: W.t });
  const baseTrkBt = CULT.trackBreakthroughChance(disc, { now: W.t });

  AI.ACTS.pray.done(disc, W);
  assert(disc.ancestralBlessing && disc.ancestralBlessing.tabletId === tab.id, 'Prayer action must grant ancestralBlessing');
  assert.equal(CULT.isAncestralBlessingActive(disc, W.t), true);

  // Active blessing boosts ordinary & specialization breakthrough chances
  const blessedOrdBt = CULT.breakthroughChance(disc, { now: W.t });
  const blessedTrkBt = CULT.trackBreakthroughChance(disc, { now: W.t });
  assert(blessedOrdBt > baseOrdBt, 'Active ancestral blessing must boost ordinary breakthrough chance');
  assert(blessedTrkBt > baseTrkBt, 'Active ancestral blessing must boost specialization breakthrough chance');

  // Study and guidedStudy speed with active vs expired blessing (and no double-counting in studyCost)
  const testTech = CULT.tech('ART190_XIAN_001');
  const costWithoutBless = (() => { const saved = disc.ancestralBlessing; disc.ancestralBlessing = null; const c = CULT.studyCost(testTech, disc); disc.ancestralBlessing = saved; return c; })();
  assert.equal(CULT.studyCost(testTech, disc), costWithoutBless, 'studyCost must not double-count ancestralBlessing studySpeedMult');

  disc.cult.learning = { id: testTech.id, need: 1000, got: 0 };
  AI.ACTS.study.tick(disc, W);
  const gotActiveStudy = disc.cult.learning.got;
  disc.cult.learning.got = 0;
  AI.ACTS.guidedStudy.tick(disc, W, { rate: 0.01, teacherId: W.sect.masterId });
  const gotActiveGuided = disc.cult.learning.got;

  // Advance clock W.t past blessing expiry (even if W.day has NOT yet passed untilDay!)
  const expiredT = disc.ancestralBlessing.until + 10;
  W.t = expiredT;
  assert.equal(CULT.isAncestralBlessingActive(disc, W.t), false, 'Blessing must expire strictly by W.t');
  assert.equal(CULT.breakthroughChance(disc, { now: W.t }), baseOrdBt, 'Expired blessing must not boost ordinary breakthrough chance');
  assert.equal(CULT.trackBreakthroughChance(disc, { now: W.t }), baseTrkBt, 'Expired blessing must not boost specialization breakthrough chance');

  disc.cult.learning.got = 0;
  AI.ACTS.study.tick(disc, W);
  const gotExpiredStudy = disc.cult.learning.got;
  disc.cult.learning.got = 0;
  AI.ACTS.guidedStudy.tick(disc, W, { rate: 0.01, teacherId: W.sect.masterId });
  const gotExpiredGuided = disc.cult.learning.got;
  assert(gotActiveStudy > gotExpiredStudy, 'Active blessing must accelerate study.tick compared to expired blessing');
  assert(gotActiveGuided > gotExpiredGuided, 'Active blessing must accelerate guidedStudy.tick compared to expired blessing');
  disc.cult.learning = null;

  // Injury shield protection when active vs expired
  SECT.prayAtAncestralShrine(W, disc, tab.id);
  assert.equal(disc.ancestralBlessing.injuryShield, true);
  W.rng.next = () => 0.99; // force failure on breakthrough
  const failProtected = CULT.breakthrough(W, disc, {});
  assert.equal(failProtected.ok, false);
  assert.equal(failProtected.ancestralProtected, true, 'Active injuryShield must protect against severe backlash on failed breakthrough');
  assert.equal(disc.ancestralBlessing.injuryShield, false, 'injuryShield must be consumed once triggered');

  // Re-pray, then expire W.t (while keeping W.day same) and verify expired shield does NOT protect
  SECT.prayAtAncestralShrine(W, disc, tab.id);
  W.t = disc.ancestralBlessing.until + 5;
  disc.cult.prog = CULT.threshold(disc);
  const failExpired = CULT.breakthrough(W, disc, {});
  assert.equal(failExpired.ancestralProtected, undefined, 'Expired blessing (W.t > until) must not trigger injuryShield even on the same W.day');

  // Save/load preservation
  const loaded = SIM.deserialize(SIM.serialize(W));
  assert(loaded.sect.legacyTablets.some(t => t.id === tab.id), 'Legacy tablets must survive save/load');
  assert.equal(loaded.byId[disc.id].ancestralBlessing.tabletId, tab.id, 'ancestralBlessing state must survive save/load');
  console.log('  PASS Area 2c: Ancestral legacy tablet inscription, prayer, W.t clock consistency, study/guidedStudy, breakthrough shield, and save/load verified');
}

// ============================================================================
// AREA 2d: Technique Catalog Audit (All 22 Legendaries Cross-Path/Subpath,
//          Equivalent-Stage Gates, Weapon Mismatch vs Unrestricted, Combat Math)
// ============================================================================
{
  const W = SIM.create('area2d-technique-catalog-audit');
  const allTechs = [...JD.TECH.techniques, ...JD.TECH.mantras];
  assert.equal(allTechs.length, 630, 'Total catalog must have 630 techniques and mantras');
  const legendaries = allTechs.filter(t => t.legendary);
  assert.equal(legendaries.length, 22, 'Must have 22 legendary techniques and mantras');

  // 2d.1 Every Legendary manual must be learnable across ALL 5 major paths and subpaths once effectiveTechStage >= reqTier
  const pathsToTest = [
    { path: 'XIAN', stage: 9, sub: 'SWORD_IMMORTAL' },
    { path: 'BODY', stage: 5, sub: 'VAJRA_BODHI' },      // 5-stage path -> effectiveTechStage = 7
    { path: 'GOD', stage: 4, sub: 'WAR_DEITY' },         // 4-stage path -> effectiveTechStage = 7
    { path: 'DEMON', stage: 9, sub: 'SHADOW_ASSASSIN' },
    { path: 'HEART_SOUL', stage: 9, sub: 'ZEN_VOID_MIND' }
  ];
  const tester = W.npcs[0];
  for (const pt of pathsToTest) {
    tester.cult.path = pt.path;
    tester.cult.stage = pt.stage;
    tester.cult.sub = pt.sub;
    tester.cult.track = CULT.initTrack(pt.sub, 7, W.day);
    tester.cult.techs = [];
    tester.cult.unlockedMantras = [];
    tester.cult.mantra = null;
    tester.cult.learning = null;
    assert(CULT.effectiveTechStage(tester) >= 7, `Max stage of ${pt.path} (stage ${pt.stage}) must map to effectiveTechStage >= 7`);

    for (const leg of legendaries) {
      const elig = M.eligible(tester, 'T:' + leg.id, { allowMantra: true });
      assert.equal(elig.ok, true, `Legendary ${leg.id} (${leg.cat}) must be eligible on ${pt.path}/${pt.sub} at effectiveTechStage 7, got reason=${elig.reason}`);
      const compat = M.resolveTechCompatibility(tester, leg);
      assert.equal(compat.ok, true, `Legendary ${leg.id} must be compatible on ${pt.path}/${pt.sub}`);
      assert.equal(compat.learnable, true);
      // Also test personal bag manual use via SECT.EDITOR.usePersonalItem
      tester.inv.techs = [leg.id];
      const useRes = SECT.EDITOR.usePersonalItem(W, tester.id, 'TECH_MANUAL', leg.id);
      assert.equal(useRes.ok, true, `SECT.EDITOR.usePersonalItem must allow learning legendary ${leg.id} on ${pt.path}/${pt.sub}: ${useRes.reason}`);
      tester.cult.techs = [];
      tester.cult.unlockedMantras = [];
      tester.cult.mantra = null;
    }
  }

  // 2d.2 Non-weapon techniques must NOT have arbitrary weapon restrictions
  for (const nonWpnId of ['ART190_BODY_008', 'ART190_BODY_017', 'ART190_BODY_025', 'INNATE_ELIXIR_DAO_CAULDRON', 'INNATE_TITAN_MOUNTAIN_BODY_CORE', 'INNATE_TIME_VOID_CORE']) {
    const t = CULT.tech(nonWpnId);
    assert(t, `Technique ${nonWpnId} must exist`);
    const wc = M.weaponCompatibility(tester, t);
    assert.equal(wc.state, 'UNRESTRICTED', `Non-weapon technique ${nonWpnId} must be UNRESTRICTED, got ${wc.state}`);
    assert.equal(wc.mult, 1);
    assert.equal(wc.accDelta, 0);
  }

  // 2d.3 Weapon-dependent moves reflect MATCHED, ADAPTED_WEAPON, SEVERE_MISMATCH, and BLOCKED_REQUIRED_WEAPON in combat
  const sword = ECO.mintGear(ECO.recipeById.MP_REC_SWORD_1, 1);
  const blade = ECO.mintGear(ECO.recipeById.MP_REC_BLADE_1, 1);
  const bow = ECO.mintGear(ECO.recipeById.MP_REC_BOW_1, 1);
  tester.cult.path = 'XIAN';
  tester.cult.sub = 'SWORD_IMMORTAL';
  tester.cult.stage = 6;
  const swordTech = CULT.tech('LEG_COMBAT_DUGU_NINE_SWORDS'); // weaponTypes: ['SWORD'], requiresWeapon: false
  const reqBowTech = CULT.tech('MP_BOW_IRON_DRAW_T1');        // weaponTypes: ['BOW'], requiresWeapon: true

  tester.equip.WEAPON = sword;
  const wcMatch = M.weaponCompatibility(tester, swordTech);
  assert.equal(wcMatch.state, 'MATCHED');
  assert.equal(wcMatch.mult, 1.15);
  assert.equal(wcMatch.accDelta, 4);

  tester.equip.WEAPON = blade;
  const wcAdapt = M.weaponCompatibility(tester, swordTech);
  assert.equal(wcAdapt.state, 'ADAPTED_WEAPON');
  assert.equal(wcAdapt.mult, 0.65);
  assert.equal(wcAdapt.accDelta, -4);
  assert.equal(wcAdapt.qiCostMult, 1.10);

  tester.equip.WEAPON = bow;
  const wcSevere = M.weaponCompatibility(tester, swordTech);
  assert.equal(wcSevere.state, 'SEVERE_MISMATCH');
  assert.equal(wcSevere.mult, 0.65);
  assert.equal(wcSevere.accDelta, -12);
  assert.equal(wcSevere.qiCostMult, 1.25);

  tester.equip.WEAPON = sword;
  const wcBlocked = M.weaponCompatibility(tester, reqBowTech);
  assert.equal(wcBlocked.state, 'BLOCKED_REQUIRED_WEAPON');
  assert.equal(wcBlocked.canUse, false);
  assert.equal(M.skillEfficiency(tester, SK.profile(reqBowTech)), 0, 'requiresWeapon move must have 0 efficiency when wrong weapon is equipped');

  // Verify real combat C.strike receives wpnAcc delta (+4 matched vs -12 severe mismatch) and Qi cost scales properly
  const target = W.npcs[1];
  tester.cult.techs = [swordTech.id];
  const prof = SK.list(tester).find(p => (p.tech || p.id) === swordTech.id);
  assert(prof, 'Learned swordTech must appear in SK.list');
  assert(prof.summary.includes('×0.65'), 'Move summary must state ×0.65 for mismatched weapon');

  tester.equip.WEAPON = sword;
  const qiMatched = SK.qiCost(tester, prof);
  tester.equip.WEAPON = bow;
  const qiSevere = SK.qiCost(tester, prof);
  assert(qiSevere > qiMatched, `Severe weapon mismatch must increase Qi cost (${qiSevere} > ${qiMatched})`);

  const seenAccAdds = [];
  const origStrike = COMBAT.strike;
  COMBAT.strike = (w, f, a, d, o) => { seenAccAdds.push(o.accAdd); return { hit: true, dmg: 10 }; };
  const fight = { id: 991, A: [tester.id], B: [target.id], serious: false, log: [] };
  for (const wpn of [sword, blade, bow]) {
    tester.equip.WEAPON = wpn;
    tester.act = { id: 'fight', ctx: { cds: {} } };
    tester.h.state.qi = CULT.qiMax(tester);
    STATS.dirty(tester);
    COMBAT.useSkill(W, fight, tester, target, prof);
  }
  COMBAT.strike = origStrike;
  assert.equal(seenAccAdds[0] - seenAccAdds[1], 8, 'Matched weapon (+4) vs Adapted weapon (-4) must differ by +8 accAdd in real combat');
  assert.equal(seenAccAdds[1] - seenAccAdds[2], 8, 'Adapted weapon (-4) vs Severe mismatch (-12) must differ by +8 accAdd in real combat');
  console.log('  PASS Area 2d: All 22 Legendaries cross-path/subpath eligibility, non-weapon unrestricted check, and weapon compatibility combat math verified');
}

// ============================================================================
// MULTI-SEED BOUNDED SIMULATION: Action Diversity, Skill Growth, Stalled Goals
// ============================================================================
{
  const seeds = ['patch-sim-seed-alpha', 'patch-sim-seed-beta'];
  for (const seed of seeds) {
    const W = SIM.create(seed);
    // Put one disciple on a near-bottleneck track to verify natural progression during multi-seed sim
    const tracker = W.npcs.find(n => n && !n.dead && n.cult && n.rank <= 2);
    if (tracker) {
      tracker.cult.path = 'DEMON';
      tracker.cult.sub = 'SHADOW_ASSASSIN';
      tracker.cult.track = CULT.initTrack('SHADOW_ASSASSIN', 1, W.day);
      tracker.cult.track.prog = CULT.trackThreshold(tracker);
      M.skillSet(tracker, 'MOVEMENT', 24);
      M.skillSet(tracker, 'stealth', 20);
      tracker.inv.stones = 200;
    }
    const startMove = tracker ? M.skillRead(tracker, 'MOVEMENT') : 0;
    const actionCounts = {};
    // Run 3 simulated days (3 * 1440 = 4320 ticks)
    for (let t = 0; t < 3 * 1440; t++) {
      SIM.tick(W);
      if (t % 60 === 0) {
        for (const n of W.npcs) {
          if (n && !n.dead && n.act && n.act.id) {
            actionCounts[n.act.id] = (actionCounts[n.act.id] || 0) + 1;
          }
        }
      }
    }
    const distinctActions = Object.keys(actionCounts).length;
    assert(distinctActions >= 8, `Seed ${seed} must exhibit healthy action diversity (>=8 distinct actions, got ${distinctActions})`);
    if (tracker && !tracker.dead) {
      assert(M.skillRead(tracker, 'MOVEMENT') > startMove || tracker.cult.track.ordinal >= 2, `Seed ${seed}: bottlenecked NPC must improve MOVEMENT or advance ordinal during simulation`);
    }
    const alive = W.npcs.filter(n => n && !n.dead);
    const starving = alive.filter(n => n.h.state.satiety <= 0).length;
    assert.equal(starving, 0, `Seed ${seed}: 0 NPCs should starve when sect has provisions`);
  }
  console.log('  PASS Multi-Seed Bounded Simulation: Action diversity, survival attention, and bottleneck skill progression verified');
}

console.log('PASS diplomacy, sanctum, ancestral, bottleneck & technique catalog suite');
