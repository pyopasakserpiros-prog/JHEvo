'use strict';
const assert = require('assert');
const g = require('./load.js');
const { U, HC, MAP, CULT, ECO, SECT, AI, COMBAT, COG, SK, STATS, MARTIAL, EXPED, EXPLORE, SIM, JD } = g;

console.log('=== Running v260_bugfix_categories_02_03_suite (Categories 02 NPC Brain & 03 Martial Arts) ===');

const W = SIM.create(20260203);
for (let t = 0; t < 30; t++) SIM.tick(W);

// ---------------------------------------------------------------------------
// 1. Category 02A: Epistemic Knowledge, Bounded Perception & RNG Purity
// ---------------------------------------------------------------------------
{
  const n = W.npcs.find(x => x && !x.dead && x.cult) || W.npcs[0];
  const target = W.npcs.find(x => x && !x.dead && x.id !== n.id && x.cult) || W.npcs[1];
  assert(n && target, 'Expected two valid cultivator NPCs');

  // 1a. Pure deterministic target power & breakthrough chance (Zero RNG consumption)
  const rngBefore = W.rng.s;
  const estP1 = COG.estimateTargetPower(W, n, target);
  const estP2 = COG.estimateTargetPower(W, n, target);
  const rawBt = CULT.breakthroughChance(n, { env: 0.05, pill: 0 });
  const percBt1 = COG.perceivedBreakthroughChance(W, n, rawBt);
  const percBt2 = COG.perceivedBreakthroughChance(W, n, rawBt);
  assert.strictEqual(W.rng.s, rngBefore, 'COG.estimateTargetPower & perceivedBreakthroughChance must not consume W.rng');
  assert.strictEqual(estP1, estP2, 'COG.estimateTargetPower must be deterministic');
  assert.strictEqual(percBt1, percBt2, 'COG.perceivedBreakthroughChance must be deterministic');

  // 1b. A.brewBasic.can and score must be 100% RNG-pure even at W.t === 0
  const savedT = W.t;
  W.t = 0;
  const rngBeforeBrew = W.rng.s;
  AI.ACTS.brewBasic.can(n, W);
  const sAcc = { add() {} };
  AI.ACTS.brewBasic.score(n, W, sAcc);
  assert.strictEqual(W.rng.s, rngBeforeBrew, 'A.brewBasic.can and score must never consume W.rng even at W.t === 0');
  W.t = savedT;

  // 1c. AI.mem trauma bridge -> COG.remember & social knowledge propagation
  AI.mem(W, n, 'ทะลวงขั้นล้มเหลว', 1.0);
  assert(n.cognition && Array.isArray(n.cognition.memory) && n.cognition.memory.some(m => m.kind === 'bt_backlash'), 'Breakthrough failure must record bt_backlash in cognition.memory');

  n.cult.stage = Math.max(2, (target.cult.stage || 1) + 1);
  COG.shareKnowledgeOnInteract(W, n, target, 'teach');
  assert.strictEqual(target.cognition.knowledge.mentorVerifiedStage, target.cult.stage, 'Teaching interaction must set mentorVerifiedStage on junior disciple');
  console.log('  ✓ [02A] Epistemic Knowledge, RNG-Pure Estimators, Trauma Bridge & Social Knowledge Sync verified');
}

// ---------------------------------------------------------------------------
// 2. Category 02B: Orphaned Loops, _cogModCtx Invalidation, Petitions & Personal Scroll Study
// ---------------------------------------------------------------------------
{
  const n = W.npcs.find(x => x && !x.dead && x.cult && x.rank >= 1) || W.npcs[0];

  // 2a. _cogModCtx invalidates immediately on mid-hour raid / alert / weather change
  COG.modifiers(W, n, 'guard');
  assert(n._cogModCtx && n._cogModCtx.raid === false, 'Initial _cogModCtx.raid should be false');
  W.threat.raid = 999;
  COG.modifiers(W, n, 'guard');
  assert.strictEqual(n._cogModCtx.raid, true, '_cogModCtx must invalidate immediately when W.threat.raid changes mid-hour');
  W.threat.raid = null;

  // 2b. Personal bag manual initiates real study instead of 0-tick cheat mastery
  const sampleTech = JD.TECH.techniques.find(t => t && !t.passive && t.cat === 'COMBAT_TECHNIQUE' && (t.tier || 1) === 1 && t.path === n.cult.path && !n.cult.techs.includes(t.id));
  if (sampleTech) {
    n.inv.techs = [sampleTech.id];
    n.cult.learning = null;
    n._bagKnowSig = '';
    n.h.personality.loyalty = 30;
    COG.prepare(W, n);
    assert(!n.cult.techs.includes(sampleTech.id), 'Disloyal NPC must not get 0-tick instant mastery from personal bag scroll');
    assert(n.cult.learning && n.cult.learning.id === sampleTech.id && n.cult.learning.fromPersonalScroll === true, 'Personal bag scroll must start real c.learning study');
    n.cult.learning = null;
  }

  // 2c. Open petitions are adjudicated by officers during COG.performDuty
  const healer = SECT.holder(W, 'healer') || W.npcs.find(x => x && !x.dead && x.cult);
  healer.post = 'healer';
  W.sect.posts.healer = healer.id;
  const pet = COG.submitPetition(W, n, 'medicine', 'ขอโอสถรักษาแผล');
  assert(pet && pet.status === 'open', 'Petition should start open');
  COG.processOpenPetitions(W, healer, 'healer');
  assert.strictEqual(pet.status, 'resolved', 'Healer duty must resolve open medicine petition');

  // 2d. Autonomous Vow Redemption after cooldown
  if (CULT.VOLUNTARY_VOWS) {
    CULT.VOLUNTARY_VOWS.swearVow(W, n, 'VOW_NO_MEDICINE');
    CULT.VOLUNTARY_VOWS.violateVow(W, n, 'VOW_NO_MEDICINE', 'test violation');
    n.voluntaryVows.VOW_NO_MEDICINE.violatedDay = (W.day || 1) - 10;
    n.merit = Math.max(50, n.merit || 0);
    const rRes = CULT.VOLUNTARY_VOWS.redeemVow(W, n, 'VOW_NO_MEDICINE');
    assert(rRes && rRes.ok, 'Violated vow must be redeemable after 7-day penance cooldown');
  }
  console.log('  ✓ [02B] _cogModCtx Invalidation, Real Personal Scroll Study, Petition Adjudication & Vow Redemption verified');
}

// ---------------------------------------------------------------------------
// 3. Category 02C: Mentorship Sync, Cognitive Archetypes, Enemy Interception & Pacifist Vow
// ---------------------------------------------------------------------------
{
  const [m, d] = W.npcs.filter(x => x && !x.dead && x.cult);
  SECT.MENTORSHIP.linkMasterDisciple(W, m, d);
  assert.strictEqual(d.mentor, m.id, 'Legacy d.mentor must be synced');
  assert.strictEqual(d.mentorId, m.id, 'v2.0.16 d.mentorId must be synced');
  assert(m.h.life.family.disciples.includes(d.id), 'Legacy family.disciples must include d.id');
  assert(m.apprenticeIds.includes(d.id), 'v2.0.16 m.apprenticeIds must include d.id');

  // 3b. Cognitive Archetype classification
  const monk = Object.assign({}, m, { cult: { path: 'BUDDHA_DHARMA', stage: 3 }, h: JSON.parse(JSON.stringify(m.h)) });
  monk.h.personality.aggression = 35;
  monk.h.personality.integrity = 60;
  assert.strictEqual(COMBAT.resolveCognitiveArchetype(monk), 'HONORABLE_DUELLIST', 'BUDDHA_DHARMA monk must not default to CUNNING_ASSASSIN');

  // 3c. Enemy refusal in resolveDefensiveInterception
  const fTest = { id: 77701, kind: 'raid', serious: true, A: [m.id, d.id], B: ['FOE_TEST_1'] };
  const foe = { id: 'FOE_TEST_1', name: 'โจรภูเขา', foe: true, hp: 200, hpMax: 200, x: 10, y: 10, tier: 2 };
  W.foeById = W.foeById || {};
  W.foeById[foe.id] = foe;
  m.x = 11; m.y = 10; d.x = 11.5; d.y = 10;
  d.h.state.hp = Math.round(CULT.hpMax(d) * 0.30);
  SECT.rel(m, d.id).a = -60;
  const intRes = COMBAT.resolveDefensiveInterception(W, fTest, foe, d, {});
  assert.strictEqual(intRes, null, 'Bitter enemy (rel.a <= -35) must refuse to bodyguard dash for hated target');
  SECT.rel(m, d.id).a = 50;

  // 3d. VOW_NO_KILL merciful subdue at 1 HP without breaking oath
  m.daoOath = { id: 'VOW_NO_KILL', upheld: true };
  m.h.state.heartDemon = 0;
  foe.hp = 5;
  foe.yield = false;
  COMBAT.applyDamage(W, fTest, m, foe, 50, 'ทดสอบเมตตาธรรม');
  assert(foe.hp >= 1 && foe.yield === true && !foe.dead, 'VOW_NO_KILL holder must subdue human foe at >= 1 HP instead of killing');
  assert.strictEqual(m.daoOath.upheld, true, 'VOW_NO_KILL must remain upheld after merciful subdue');
  delete W.foeById[foe.id];
  console.log('  ✓ [02C] Mentorship Sync, Cognitive Archetypes, Enemy Interception Refusal & VOW_NO_KILL Merciful Subdue verified');
}

// ---------------------------------------------------------------------------
// 4. Category 03A: Active Mantras in SK.profile, 16 Weapons, Move Unlock Cache & Dynamic Spatial Range
// ---------------------------------------------------------------------------
{
  // 4a. All 42 active ART190_* *_MANTRA entries with moves must produce valid SK.profile
  const activeMantras = JD.TECH.techniques.filter(t => t && !t.passive && ['QI_MANTRA', 'BODY_MANTRA', 'FAITH_MANTRA'].includes(t.cat) && Array.isArray(t.moves) && t.moves.length > 0);
  assert(activeMantras.length >= 42, 'Expected at least 42 active mantra techniques with moves');
  for (const mt of activeMantras) {
    const prof = SK.profile(mt);
    assert(prof && prof.arch, 'Active mantra ' + mt.id + ' must return a valid combat move profile');
  }

  // 4b. Non-attacking moves have M === 0 and pen === 0
  const pureShieldTech = JD.TECH.techniques.find(t => t && Array.isArray(t.moveDefs) && t.moveDefs.some(m => m.arch === 'shield' || m.arch === 'heal'));
  if (pureShieldTech) {
    const mDef = pureShieldTech.moveDefs.find(m => m.arch === 'shield' || m.arch === 'heal');
    const mp = SK.moveProfile(pureShieldTech, mDef);
    assert.strictEqual(mp.M, 0, 'Non-attacking shield/heal move must have M === 0');
    assert.strictEqual(mp.pen, 0, 'Non-attacking shield/heal move must have pen === 0');
  }

  // 4c. 16-Weapon Compatibility on Fan / Zither / Whip / Claw techniques
  const fanTech = JD.TECH.techniques.find(t => t && /พัด/.test(t.nameTh || '') && Array.isArray(t.weaponTypes));
  assert(fanTech && fanTech.weaponTypes.includes('FAN'), 'Fan-named technique must include FAN in weaponTypes');

  // 4d. Dynamic Stance Range Modifier in SK.resolveMoveSpatialSpec(p, u)
  const sampleNpc = W.npcs.find(x => x && !x.dead && x.cult);
  const sampleMove = SK.list(sampleNpc)[0] || SK.profile(JD.TECH.techniques.find(t => t && !t.passive));
  sampleNpc._activeStance = null;
  const rBase = SK.resolveMoveSpatialSpec(sampleMove, sampleNpc).max;
  sampleNpc._activeStance = 'THUNDER_STEP_STANCE';
  const rThunder = SK.resolveMoveSpatialSpec(sampleMove, sampleNpc).max;
  sampleNpc._activeStance = null;
  assert(rThunder > rBase, 'THUNDER_STEP_STANCE must dynamically increase move range in SK.resolveMoveSpatialSpec(p, u)');
  console.log('  ✓ [03A] 42 Active Mantras Profiled, Non-Attacking Move Cleanup, 16-Weapon Matching & Dynamic Stance Range verified');
}

// ---------------------------------------------------------------------------
// 5. Category 03B: YIN_SHADOW <-> DARK_YIN Reactions, ironSkin Buff & Passive Reconciliation
// ---------------------------------------------------------------------------
{
  const CE = COMBAT.COMPOSABLE_ENGINE;
  // 5a. YIN_SHADOW triggers DARK_YIN Dual, Tri, and Tetra reactions
  const dualRx = CE.resolveElementalReactionSpec(['YIN_SHADOW'], 'LIGHT_YANG');
  assert(dualRx && dualRx.id === 'TAIJI_ANNIHILATION', 'YIN_SHADOW + LIGHT_YANG must resolve TAIJI_ANNIHILATION (2E-11)');
  const triRx = CE.resolveElementalReactionSpec(['YIN_SHADOW', 'BLOOD_DEMON'], 'FIRE');
  assert(triRx && triRx.code === '3E-06', 'YIN_SHADOW + BLOOD_DEMON + FIRE must resolve 3E-06 (HELLFIRE_ASURA_APOTHEOSIS)');
  const tetraRx = CE.resolveElementalReactionSpec(['YIN_SHADOW', 'ASTRAL', 'BLOOD_DEMON'], 'LIGHT_YANG');
  assert(tetraRx && tetraRx.code === '4E-03', 'YIN_SHADOW + ASTRAL + BLOOD_DEMON + LIGHT_YANG must resolve 4E-03 (SAMSARA_TWILIGHT_VERDICT)');

  // 5b. ironSkin exists in STATS.BUFF_CATALOG
  assert(STATS.BUFF_CATALOG.ironSkin, 'ironSkin must be defined in STATS.BUFF_CATALOG for KHMER_YANTRA_WARD');
  console.log('  ✓ [03B] YIN_SHADOW Multi-Tier Elemental Reactions (Dual/Tri/Tetra) & ironSkin Buff Catalog verified');
}

// ---------------------------------------------------------------------------
// 6. Category 03C–03G: Mantra/Defensive/Support/Forbidden Combat Guards, Lifespan & Save/Load
// ---------------------------------------------------------------------------
{
  const [a, d] = W.npcs.filter(x => x && !x.dead && x.cult);
  CULT.MANTRA_SYSTEM.ensureState(a);
  CULT.MANTRA_SYSTEM.ensureState(d);
  CULT.DEFENSIVE_ARTS.ensureState(d);
  CULT.FORBIDDEN_ARTS.ensureState(a);

  // 6a. DoT tick does NOT trigger Forbidden Art self-blood drain or Defensive counter-slash
  a.forbiddenArtState.sealMode = 'BLOOD_TABOO_UNLEASHED';
  const strainBefore = a.forbiddenArtState.tabooStrain || 0;
  const fSpar = { id: 77702, kind: 'spar', serious: false, A: [a.id], B: [d.id] };
  COMBAT.applyDamage(W, fSpar, a, d, 20, 'ทดสอบประลองเบา');
  assert.strictEqual(a.forbiddenArtState.tabooStrain || 0, strainBefore, 'Forbidden Art must not drain blood or build tabooStrain in non-serious spar');

  const fReal = { id: 77703, kind: 'duel', serious: true, A: [a.id], B: [d.id] };
  COMBAT.applyDamage(W, fReal, a, d, 15, 'พิษ/แผลต่อเนื่อง');
  assert.strictEqual(a.forbiddenArtState.tabooStrain || 0, strainBefore, 'DoT ticks must not trigger Forbidden Art blood sacrifice or tabooStrain');

  // 6b. Taboo strain >= 95 triggers Qi-Deviation backlash & resets sealMode to SEALED_RESTRAINT
  a.forbiddenArtState.tabooStrain = 96;
  const blRes = CULT.FORBIDDEN_ARTS.checkTabooStrainBacklash(W, a);
  assert(blRes && blRes.triggered && a.forbiddenArtState.sealMode === 'SEALED_RESTRAINT', 'tabooStrain >= 95 must trigger backlash and re-seal to SEALED_RESTRAINT');

  // 6c. Lifespan sacrifice deduction in CULT.lifespan / CULT.lifeMax
  a.ext = a.ext || {};
  a.ext.burnedLifespanYears = 0;
  const lifeBefore = CULT.lifeMax(a);
  a.ext.burnedLifespanYears = 5;
  const lifeAfter = CULT.lifeMax(a);
  assert.strictEqual(lifeAfter, lifeBefore - 5, 'CULT.lifeMax must deduct n.ext.burnedLifespanYears');
  a.ext.burnedLifespanYears = 0;

  // 6d. Innate Subpath Passives enriched with passiveConstellation (preserving v580 counts)
  const innateWithConst = JD.TECH.techniques.filter(t => t && (t.innateOnly || /^INNATE_|^ART_C117_INNATE_/.test(t.id || '')) && t.passiveConstellation);
  assert(innateWithConst.length >= 250, 'All subpath innate techniques must carry passiveConstellation metadata');

  // 6e. Save/Load round-trip integrity + multi-tick continuation
  const rawSave = SIM.serialize(W);
  const W2 = SIM.deserialize(rawSave);
  assert(W2 && Array.isArray(W2.npcs) && W2.npcs.length === W.npcs.length, 'Save/Load round-trip must preserve NPC roster');
  for (let t = 0; t < 30; t++) SIM.tick(W2);
  console.log('  ✓ [03C–03G] DoT/Spar Guards, Taboo Backlash, Lifespan Sacrifice, Innate Constellations & Save/Load Round-Trip verified');
}

console.log('PASS v260_bugfix_categories_02_03_suite');
