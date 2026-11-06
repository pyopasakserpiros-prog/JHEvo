#!/usr/bin/env node
'use strict';

/**
 * JianghuSect Evolution — Patch v3.0.0 Tactical Combat & Living Chronicle Suite
 * Verifies:
 *  1. 5-Band Range System (SK.RANGE_BANDS), Move Spatial Specs (SK.resolveMoveSpatialSpec) & Weapon Tactical Profiles
 *  2. Spatial Line-of-Sight (COMBAT.checkLineOfSight), Vanguard Interception (COMBAT.resolveDefensiveInterception), ZoC & Weapon Tactics
 *  3. 5 Cognitive Combat Archetypes (COMBAT.resolveCognitiveArchetype), Joint Engagement AI (COMBAT.evaluateTacticalEngagement) & DSH (COMBAT.evaluateTacticalBoutSummary)
 *  4. Phoenix Clause Nonlethal Yield vs Serious Death, Raid Inner Sanctum Breach/Timeout & Mid-Fight Save/Load (f.cbKind / f.tac / u.tac)
 *  5. Living Causal Chronicle v3.0 (COMBAT.buildFightChroniclePayload, EXPED.recordChronicle, SIM.snapshotPerson & historicalPeople)
 */

const assert = require('assert');
const G = require('./load');
const { SIM, SECT, CULT, COMBAT, SK, STATS, EXPED, EXPLORE, AI, HC } = G;

let passed = 0;
function ok(cond, msg) {
  assert.ok(cond, msg);
  passed++;
}

console.log('===================================================================');
console.log('   JIANGHUSECT v3.0.0 TACTICAL COMBAT & LIVING CHRONICLE SUITE     ');
console.log('===================================================================\n');

// 0. Core version & fingerprint locks
ok((SIM.PATCH_VERSION === '3.0.0' || SIM.PATCH_VERSION === '3.1.0' || SIM.PATCH_VERSION === '3.1.1' || (SIM.PATCH_VERSION === '3.2.0' || (SIM.PATCH_VERSION === '3.3.0' || (SIM.PATCH_VERSION === '3.4.0' || (SIM.PATCH_VERSION === '4.0.0' || SIM.PATCH_VERSION === '4.1.0')) || SIM.PATCH_VERSION === '3.5.0' || (SIM.PATCH_VERSION === '3.6.0' || (SIM.PATCH_VERSION === '4.0.0' || SIM.PATCH_VERSION === '4.1.0'))))), `SIM.PATCH_VERSION must be 3.0.0/3.1.0/3.1.1 (got ${SIM.PATCH_VERSION})`);
ok((SIM.SAVE_SCHEMA_VERSION === '3.0.0-tactical-chronicle' || SIM.SAVE_SCHEMA_VERSION === '3.1.0-autonomous-governance-peaks' || SIM.SAVE_SCHEMA_VERSION === '3.6.0-immortal-endgame-dynasty' || (SIM.SAVE_SCHEMA_VERSION === '4.0.0-living-frontier-charter' || SIM.SAVE_SCHEMA_VERSION === '4.1.0-sect-expansion-peaks-sanctuary')), `SIM.SAVE_SCHEMA_VERSION must be 3.0.0-tactical-chronicle`);
ok(HC.FINGERPRINT === '155:2f9c9dd7', 'HC.FINGERPRINT must remain locked at 155:2f9c9dd7');

const W = SIM.create('v300-tactical-chronicle-seed');
while (W.npcs.length < 8) {
  SIM.addNpc(W, { ageYears: 22, rank: 2, stage: 3, quality: 0.65 });
}

// ============================================================================
// 1. Pillar 1: 5-Band Range System, Move Spatial Specs & Weapon Profiles
// ============================================================================
console.log('▶ [1/5] Testing 5-Band Range System & Move Spatial Specs...');
ok(SK.RANGE_BANDS && typeof SK.RANGE_BANDS === 'object', 'SK.RANGE_BANDS exists');
for (const bandKey of ['POINT_BLANK', 'MELEE_REACH', 'EXTENDED_REACH', 'MID_TACTICAL', 'LONG_BALLISTIC']) {
  ok(SK.RANGE_BANDS[bandKey] && Number.isFinite(SK.RANGE_BANDS[bandKey].max), `Range band ${bandKey} is defined`);
}
ok(SK.classifyRangeBand(1.1).id === 'POINT_BLANK', 'classifyRangeBand(1.1).id === POINT_BLANK');
ok(SK.classifyRangeBand(1.7).id === 'MELEE_REACH', 'classifyRangeBand(1.7).id === MELEE_REACH');
ok(SK.classifyRangeBand(2.5).id === 'EXTENDED_REACH', 'classifyRangeBand(2.5).id === EXTENDED_REACH');
ok(SK.classifyRangeBand(3.8).id === 'MID_TACTICAL', 'classifyRangeBand(3.8).id === MID_TACTICAL');
ok(SK.classifyRangeBand(5.2).id === 'LONG_BALLISTIC', 'classifyRangeBand(5.2).id === LONG_BALLISTIC');

const [uTank, uCaster, uArcher, uEnemy, uEnemy2] = W.npcs;
uTank.cult.path = 'BODY';
uTank.equip = uTank.equip || {};
uTank.equip.WEAPON = { id: 'EQ_TEST_SPEAR', slot: 'WEAPON', type: 'SPEAR', gearType: 'SPEAR', nameTh: 'ทวนศึกพิทักษ์ด่าน', tier: 3 };
uCaster.cult.path = 'ARRAY_TALISMAN';
uArcher.equip = uArcher.equip || {};
uArcher.equip.WEAPON = { id: 'EQ_TEST_BOW', slot: 'WEAPON', type: 'BOW', gearType: 'BOW', nameTh: 'เกาทัณฑ์ทะลวงเมฆา', tier: 3 };
uEnemy.equip = uEnemy.equip || {};
uEnemy.equip.WEAPON = { id: 'EQ_TEST_SWORD', slot: 'WEAPON', type: 'SWORD', gearType: 'SWORD', nameTh: 'กระบี่เมฆา', tier: 3 };

const wpSpear = SK.weaponTacticalProfile(uTank);
const wpBow = SK.weaponTacticalProfile(uArcher);
const wpSword = SK.weaponTacticalProfile(uEnemy);
ok(wpSpear.reachClass === 'LONG_POLEARM' && wpSpear.engageRange >= 2.2, 'Spear has LONG_POLEARM profile and extended engageRange');
ok(wpBow.reachClass === 'RANGED_KITE' && wpBow.engageRange >= 2.8, 'Bow has RANGED_KITE profile and ranged engageRange');
ok(wpSword.reachClass === 'SHORT_SWIFT', 'Sword has SHORT_SWIFT profile');

// Move-level spatial overrides (Flying Sword & Gap-Closer & Snipe)
const flyingSwordMove = { id: 'M_FLY_SWORD', nameTh: 'กระบี่บินเหินเวหา', arch: 'snipe', type: 'p' };
const specFly = SK.resolveMoveSpatialSpec(flyingSwordMove, uEnemy);
ok(specFly.band === 'LONG_BALLISTIC' && specFly.max >= 5.2 && specFly.source === 'TECHNIQUE_OVERRIDE_LONG', 'Flying sword move resolves as LONG_BALLISTIC technique override even on a sword wielder');

const chargeMove = { id: 'M_CHARGE', nameTh: 'พุ่งทะลวงทัพ', arch: 'charge', type: 'p' };
const specCharge = SK.resolveMoveSpatialSpec(chargeMove, uTank);
ok(specCharge.isGapCloser === true && specCharge.max >= 3.2, 'Charge move resolves as gap-closer');

const snipeBowMove = { id: 'M_BOW_SNIPE', nameTh: 'ศรดาวตกผ่าดารา', arch: 'snipe', type: 'p' };
const specBowSnipe = SK.resolveMoveSpatialSpec(snipeBowMove, uArcher);
ok(specBowSnipe.band === 'LONG_BALLISTIC' && specBowSnipe.min >= 1.3 && specBowSnipe.requiresLoS === true, 'Bow snipe has LONG_BALLISTIC band, minimum range, and requiresLoS');

// ============================================================================
// 2. Pillar 2: Weapon Tactics, Line-of-Sight, Vanguard Interception & DSH
// ============================================================================
console.log('▶ [2/5] Testing Weapon Tactics, LoS, Vanguard Interception & DSH...');

// Flying art long-range bonus
uEnemy2.equip = uEnemy2.equip || {};
uEnemy2.equip.WEAPON = { id: 'EQ_TEST_BLADE', slot: 'WEAPON', type: 'BLADE', gearType: 'BLADE', nameTh: 'ดาบศึกผ่าปฐพี', tier: 3 };
const tacFlyingLong = COMBAT.resolveWeaponTactics(uEnemy, uEnemy2, { dist: 3.8, skill: flyingSwordMove });
ok(tacFlyingLong.relation === 'FLYING_ART_LONG_RANGE' && tacFlyingLong.dmgMult >= 1.08, 'Flying sword triggers FLYING_ART_LONG_RANGE tactical advantage');
const tacFlyingVsBow = COMBAT.resolveWeaponTactics(uEnemy, uArcher, { dist: 3.8, skill: flyingSwordMove });
ok((tacFlyingVsBow.relation === 'FLYING_ART_LONG_RANGE' || tacFlyingVsBow.relation === 'DASH_CLOSE_COUNTER') && tacFlyingVsBow.dmgMult >= 1.08, 'Flying sword or lightness counters ranged kiter');

// Minimum range dead-zone penalty when archer fires snipe at point-blank (dist = 0.8)
uArcher.tac = null; uEnemy.tac = null;
const tacBowPointBlank = COMBAT.resolveWeaponTactics(uArcher, uEnemy, { dist: 0.8, skill: snipeBowMove });
ok((tacBowPointBlank.relation === 'MIN_RANGE_HARASSED' || tacBowPointBlank.relation === 'RANGED_CLOSED_ON') && tacBowPointBlank.dmgMult < 0.90 && tacBowPointBlank.accAdd < 0, 'Ranged snipe suffers dead-zone penalty at point-blank');

// Abstract bout bounded multiplier
const tacAbstract = COMBAT.resolveWeaponTactics(uArcher, uEnemy, { dist: 2.2, abstractBout: true });
ok(tacAbstract.dmgMult >= 0.80 && tacAbstract.dmgMult <= 1.20, 'Abstract bout weapon tactics multiplier is strictly bounded in [0.80, 1.20]');

// Line of Sight & Vanguard Interception
const fTacTest = COMBAT.startFight(W, [uTank.id, uCaster.id], [uEnemy.id], 'spar', { serious: false });
fTacTest.state = 'fight';
// Place uEnemy at (50, 50), uTank at (52, 50) directly in front of fragile uCaster at (54, 50)
uEnemy.x = 50; uEnemy.y = 50;
uTank.x = 52; uTank.y = 50;
uCaster.x = 54; uCaster.y = 50;
COMBAT.setHp(uTank, COMBAT.hpMax(uTank));
COMBAT.setHp(uCaster, Math.round(COMBAT.hpMax(uCaster) * 0.45));
uTank.tac = null; uCaster.tac = null; uEnemy.tac = null;
COMBAT.ensureUnitTac(uTank).reactionCharges = 1;
COMBAT.ensureUnitTac(uTank).reactionReadyAt = 0;

const losRes = COMBAT.checkLineOfSight(W, fTacTest, uEnemy, uCaster, specBowSnipe);
ok(losRes.clear === false && losRes.blockerUnit && losRes.blockerUnit.id === uTank.id, 'checkLineOfSight detects vanguard uTank blocking the firing line toward backline uCaster');

const interceptRes = COMBAT.resolveDefensiveInterception(W, fTacTest, uEnemy, uCaster, { moveSpec: specBowSnipe });
ok(interceptRes && interceptRes.interceptor && interceptRes.interceptor.id === uTank.id && interceptRes.kind === 'LOS_COVER', 'Vanguard uTank intercepts ranged attack aimed at fragile ally uCaster via LOS_COVER');
ok(interceptRes.dmgMult <= 0.85, 'Interception mitigates incoming damage on vanguard');
ok(fTacTest.tac && fTacTest.tac.stats && fTacTest.tac.stats.intercepts >= 1, 'Fight tactical stats record interception count');
ok(COMBAT.unitZoCRadius(uTank) >= 1.5, 'Tank with polearm and BODY path has expanded Zone-of-Control radius');
ok(COMBAT.unitZoCRadius(uArcher) === 0, 'Ranged kiter has 0 melee Zone-of-Control radius');
const safePos = COMBAT.projectSafePosition(W, 50, 50, 51, 50);
ok(safePos && Number.isFinite(safePos.x) && Number.isFinite(safePos.y) && typeof safePos.hitObstacle === 'boolean', 'COMBAT.projectSafePosition validates raycast displacement');
ok(COMBAT.inferCombatRole(uTank) === 'TANK' && COMBAT.inferCombatRole(uCaster) === 'CASTER', 'COMBAT.inferCombatRole accurately classifies TANK and CASTER roles');

// Deterministic Spatial Heuristic (DSH) across off-map combat systems
const dshRes = COMBAT.evaluateTacticalBoutSummary([uTank, uCaster, uArcher], [uEnemy]);
ok(dshRes && dshRes.multA >= 0.80 && dshRes.multA <= 1.20 && typeof dshRes.summaryTh === 'string', 'COMBAT.evaluateTacticalBoutSummary returns bounded multipliers and Thai summary');

const assemblyBout = SECT.simulateAssemblyBout(W, uTank, uEnemy, { useFormation: true, formationPartyA: [uTank, uCaster], formationPartyB: [uEnemy] });
ok(assemblyBout && assemblyBout.winner && typeof assemblyBout.tacticalRelation === 'string', 'SECT.simulateAssemblyBout integrates weapon tactics and DSH');

const encRes = EXPED.resolveDiscipleSectEncounter(W, [uTank, uArcher], null, { forceClash: true, forceWin: true, quiet: true });
ok(encRes && encRes.ok && encRes.didClash && encRes.tacticalSummary && typeof encRes.tacticalSummary.summaryTh === 'string', 'EXPED.resolveDiscipleSectEncounter integrates DSH tacticalSummary');

const siegeRes = EXPED.resolveSectSiege(W, W.world.sects[0], { members: [uTank, uArcher, uCaster], forceWin: true });
ok(siegeRes && siegeRes.ok && siegeRes.won && Array.isArray(siegeRes.phases) && siegeRes.phases.length === 3, 'EXPED.resolveSectSiege completes 3 phases with tactical summary');
ok(typeof siegeRes.phases[1].tacticalSummaryTh === 'string' && siegeRes.phases[1].tacticalSummaryTh.length > 0, 'Siege Phase 2 records DSH tacticalSummaryTh');

// Clean up fTacTest
fTacTest.over = true;
COMBAT.conclude(W, fTacTest);

// ============================================================================
// 3. Pillar 3: Cognitive Combat Archetypes, Pure Read-Only AI & Channeling
// ============================================================================
console.log('▶ [3/5] Testing 5 Cognitive Archetypes, Pure Eval Invariant & Channeling...');
const archTank = COMBAT.resolveCognitiveArchetype(uTank);
const archArcher = COMBAT.resolveCognitiveArchetype(uArcher);
const validArchetypes = ['GRAND_TACTICIAN', 'CUNNING_ASSASSIN', 'BLOODTHIRSTY_BERSERKER', 'HONORABLE_DUELLIST', 'INSTINCTIVE_BEAST'];
ok(validArchetypes.includes(archTank), `resolveCognitiveArchetype returns valid archetype for tank (${archTank})`);
ok(validArchetypes.includes(archArcher), `resolveCognitiveArchetype returns valid archetype for archer (${archArcher})`);

const fAi = COMBAT.startFight(W, [uTank.id, uArcher.id], [uEnemy.id, uEnemy2.id], 'spar', { serious: false });
fAi.state = 'fight';
const rngBeforeAi = JSON.stringify(W.rng.getState());
const tps = COMBAT.computeTargetPriorityScore(W, fAi, uTank, uEnemy, { dist: 2.0 });
const eng = COMBAT.evaluateTacticalEngagement(W, fAi, uTank, uTank.act.ctx);
ok(Number.isFinite(tps) && eng && eng.target && Number.isFinite(eng.desiredRange), 'COMBAT.evaluateTacticalEngagement and computeTargetPriorityScore return valid tactical engagement');
ok(JSON.stringify(W.rng.getState()) === rngBeforeAi, 'Pure read-only tactical evaluation NEVER consumes W.rng');

// Stunned movement lock check
STATS.addStatus(uTank, 'stun', 6, null, W.t);
const oldTankX = uTank.x, oldTankY = uTank.y;
COMBAT.fightStep(W, uTank);
ok(uTank.x === oldTankX && uTank.y === oldTankY, 'Stunned unit must not walk during COMBAT.fightStep');
STATS.clearStatus(uTank, x => x.k === 'stun');

// Channeling & Leash / Interrupt check
uCaster.act.ctx.channeling = {
  skillId: 'TEST_CHAN',
  skill: { id: 'TEST_CHAN', nameTh: 'ค่ายกลดาราผลาญฟ้า', cd: 16, type: 'm' },
  targetId: uEnemy.id,
  lockType: 'UNIT',
  maxRange: 3.5,
  startDist: 2.0,
  ticksLeft: 3,
  totalTicks: 3,
  tickM: 0.5,
  finishM: 1.0,
  interruptForce: 12
};
COMBAT.interruptChannel(W, fAi, uCaster, 'ถูกทวนสกัดจุด');
ok(!uCaster.act.ctx.channeling, 'COMBAT.interruptChannel cleanly terminates active channel and puts skill on partial cooldown');
ok(fAi.tac.stats.interrupts >= 1, 'Fight tactical stats increment interrupts counter');

fAi.over = true;
COMBAT.conclude(W, fAi);

// ============================================================================
// 4. Pillar 4: Phoenix Clause Nonlethal Safety & Mid-Fight Save/Load Roundtrip
// ============================================================================
console.log('▶ [4/5] Testing Phoenix Clause Nonlethal Yield & Mid-Fight Save/Load...');
const fSpar = COMBAT.startFight(W, [uTank.id], [uEnemy.id], 'spar', { serious: false });
fSpar.state = 'fight';
uTank.yield = false; uTank.dead = false;
uTank._phoenixClauseReady = true;
COMBAT.setHp(uTank, Math.round(COMBAT.hpMax(uTank) * 0.25));

// First lethal blow triggers Phoenix Clause rebirth (48% HP + shield)
COMBAT.applyDamage(W, fSpar, uEnemy, uTank, COMBAT.hpMax(uTank) * 2, 'ท่าสังหารแรก');
ok(uTank.dead === false && uTank.yield === false && fSpar.tac.phoenixClauseUsed[uTank.id] === true, 'Phoenix Clause triggers once on first lethal blow');
ok(COMBAT.hp(uTank) >= Math.floor(COMBAT.hpMax(uTank) * 0.40), 'Phoenix Clause restores HP to ~48%');

// Second lethal blow in nonlethal spar does NOT trigger Phoenix Clause again, and cleanly yields without death
COMBAT.applyDamage(W, fSpar, uEnemy, uTank, COMBAT.hpMax(uTank) * 5, 'ท่าปิดฉาก');
ok(uTank.dead === false && uTank.yield === true && COMBAT.hp(uTank) >= 1, 'Second lethal blow in nonlethal spar causes clean yield without death');

fSpar.over = true;
COMBAT.conclude(W, fSpar);

// 4b. Mid-fight Save/Load preserves f.cbKind, f.tac, and u.tac
const fSave = COMBAT.startFight(W, [uTank.id], [uEnemy.id], 'grudge', { serious: false, cb: COMBAT.duelEnd });
fSave.state = 'fight';
COMBAT.recordTacticalHighlight(W, fSave, 'TACTICAL_INTERCEPT', 'ทดสอบบันทึกไฮไลต์ระหว่างศึก');
const rawMidFight = SIM.serialize(W);
const WLoaded = SIM.deserialize(rawMidFight);
const fLoaded = (WLoaded.fights || []).find(q => q.id === fSave.id);
ok(fLoaded && fLoaded.cbKind === 'duel', 'Mid-fight deserialization preserves f.cbKind === duel for grudge fights');
ok(fLoaded.tac && Array.isArray(fLoaded.tac.highlights) && fLoaded.tac.highlights.length >= 1, 'Mid-fight deserialization preserves f.tac highlights');
fSave.over = true;
COMBAT.conclude(W, fSave);

// ============================================================================
// 5. Pillar 5: Living Causal Chronicle v3.0 & Historical People Snapshot
// ============================================================================
console.log('▶ [5/5] Testing Living Causal Chronicle v3.0 & Historical People...');
const fChron = COMBAT.startFight(W, [uTank.id], [uEnemy.id], 'duel', { serious: false });
fChron.state = 'fight';
fChron.winner = 'A';
COMBAT.recordTacticalHighlight(W, fChron, 'ZOC_INTERCEPT', 'ทวนสกัดกั้นเขตคุกคาม');
const payload = COMBAT.buildFightChroniclePayload(W, fChron);
ok(payload && payload.fightId === fChron.id && payload.outcome === 'VICTORY_A', 'buildFightChroniclePayload returns structured combat summary');
ok(typeof payload.tacticalSummaryTh === 'string' && payload.highlights.length >= 1, 'buildFightChroniclePayload includes Thai tactical summary and highlights');
fChron.over = true;
COMBAT.conclude(W, fChron);

const chronEntry = EXPED.recordChronicle(W, {
  category: 'BATTLE',
  titleTh: 'ศึกประลองยุทธวิธีทดสอบ v3.0.0',
  storyTh: 'ศิษย์สำนักแลกเปลี่ยนกระบวนท่าตามระยะ',
  npcIds: [uTank.id, uEnemy.id],
  combatSummary: payload,
  allowDuplicate: true,
  quiet: true
});
ok(chronEntry && typeof chronEntry.originCauseTh === 'string' && typeof chronEntry.actorChainTh === 'string', 'EXPED.recordChronicle populates causal chain metadata');
ok(chronEntry.playerLensHighlights && chronEntry.playerLensHighlights.GRAND_STRATEGIST, 'EXPED.recordChronicle populates 4 player lens highlights');
ok(Array.isArray(chronEntry.actorSnapshots) && chronEntry.actorSnapshots.length === 2, 'EXPED.recordChronicle snapshots participating NPCs');

// Historical person snapshot on death & persistence across save/load
const tempVictim = SIM.addNpc(W, { ageYears: 29, rank: 2, stage: 3, quality: 0.6 });
const victimId = tempVictim.id;
AI.kill(W, tempVictim, 'สละชีพปกป้องสำนักในการทดสอบ v3.0');
ok(W.sect.historicalPeople && W.sect.historicalPeople[victimId], 'AI.kill snapshots fallen NPC into W.sect.historicalPeople');
ok(W.sect.historicalPeople[victimId].dead === true && W.sect.historicalPeople[victimId].statusTh.includes('สละชีพ'), 'Historical snapshot records death status and cause');

const savedAfterDeath = SIM.serialize(W);
const loadedAfterDeath = SIM.deserialize(savedAfterDeath);
ok(loadedAfterDeath.sect.historicalPeople && loadedAfterDeath.sect.historicalPeople[victimId], 'W.sect.historicalPeople persists across SIM.serialize / SIM.deserialize');

console.log(`\n✅ PASS: v300_tactical_combat_and_living_chronicle_suite (${passed} assertions passed)`);
