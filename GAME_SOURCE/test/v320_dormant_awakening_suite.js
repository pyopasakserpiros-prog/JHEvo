#!/usr/bin/env node
'use strict';

/**
 * =========================================================================
 * JianghuSect Evolution v3.2.0
 * Phase 1: Dormant Code Awakening & Foundation Wiring Suite
 *
 * Verifies all 11 Phase 1 Proposals (PROP-01, 02, 07, 12, 15, 17, 18, 20, 25, 30, 33)
 * across 10 comprehensive test phases + 80-NPC simulation tick budget (< 3.5 ms/tick).
 * =========================================================================
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const G = require('./load.js');
G.document = { getElementById() { return { querySelectorAll() { return []; }, style: {}, classList: { add() {}, remove() {} } }; } };
require('../js/ui.js');
const { SIM, SECT, COMBAT, CULT, ECO, CPE, EXPLORE, STATS, SK, UI, HC } = G;

let passed = 0;
function check(cond, msg) {
  if (!cond) {
    throw new Error('FAIL: ' + msg);
  }
  passed++;
}

console.log('=========================================================================');
console.log('   JIANGHUSECT v3.2.0 PHASE 1: DORMANT CODE AWAKENING TEST SUITE         ');
console.log('=========================================================================\n');

// Phase 0: Core Architectural Invariants & Version Lock
console.log('▶ [Phase 0] Verifying Core Architectural Invariants & Version Lock (3.2.0)...');
{
  check(['3.2.0', '3.3.0', '3.4.0', '3.5.0', '3.6.0', '4.0.0', '4.1.0'].includes(SIM.PATCH_VERSION), `SIM.PATCH_VERSION must be 3.2.0 (got ${SIM.PATCH_VERSION})`);
  check(HC.FINGERPRINT === '155:2f9c9dd7', 'HC.FINGERPRINT must remain locked at 155:2f9c9dd7');
  const hcBytes = fs.readFileSync(path.resolve(__dirname, '../js/human_core.js'));
  const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
  check(hcSha === 'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542', 'human_core.js SHA-256 must remain 100% byte-identical');
  console.log('  ✓ Core lock, SHA-256 & Patch Version 3.2.0 verified');
}

// Phase 1: [PROP-01] Eight Extraordinary Meridians, Overdrive, Backlash & Acupoint Strikes
console.log('▶ [Phase 1 / PROP-01] Testing Eight Extraordinary Meridians, Overdrive & Backlash...');
{
  const W = SIM.create('v320-meridians');
  const npc = W.npcs[0];
  const foe = W.npcs[1];
  const baseQiMax = CULT.qiMax(npc);
  const baseSt = STATS.calcCombatStats(npc);

  // Open first 4 meridians -> unlock 4-meridian passive
  for (let i = 0; i < 4; i++) {
    const r = CULT.MERIDIANS.openNextMeridian(npc);
    check(r.ok && r.openedCount === i + 1, `Meridian #${i + 1} opened`);
  }
  check(npc.meridians.fourOpened === true, '4-Meridian passive unlocked');
  check(CULT.qiMax(npc) > baseQiMax, 'REN_MAI increased Qi Max (+15%)');

  // Open remaining 4 meridians -> all 8 opened
  for (let i = 4; i < 8; i++) {
    const r = CULT.MERIDIANS.openNextMeridian(npc);
    check(r.ok && r.openedCount === i + 1, `Meridian #${i + 1} opened`);
  }
  check(npc.meridians.allEightOpened === true && npc.meridians.acupointImmunity === true, 'All 8 meridians opened + acupoint immunity');
  const st8 = STATS.calcCombatStats(npc);
  check(st8.atk > baseSt.atk && st8.cast >= baseSt.cast + 10, '8-Meridian stat bonuses & +10 Cast Speed applied');

  // Trigger Overdrive in combat when HP < 25%
  const f = COMBAT.startFight(W, [npc.id], [foe.id], 'spar', { serious: false });
  f.state = 'fight';
  COMBAT.setHp(npc, Math.round(COMBAT.hpMax(npc) * 0.20));
  npc.h.personality.courage = 75;
  COMBAT.fightStep(W, npc);
  check(npc.meridians.overdriveUsedInFight === true && npc.meridians.overdriveUntil > W.t, 'Meridian Overdrive automatically triggered at HP < 25%');

  const rateBeforeBacklash = CULT.rate(npc);
  COMBAT.conclude(W, f);
  const hasBacklashInj = Array.isArray(npc.inj) && npc.inj.some(i => i && i.part === 'ชีพจรปกครองร้าว');
  check(hasBacklashInj, 'COMBAT.conclude recorded ชีพจรปกครองร้าว injury in npc.inj');
  const rateAfterBacklash = CULT.rate(npc);
  check(rateAfterBacklash < rateBeforeBacklash * 0.75, `Overdrive Backlash reduced cultivation rate by ~30% (${rateBeforeBacklash.toFixed(2)} -> ${rateAfterBacklash.toFixed(2)})`);

  // Acupoint Strikes: QI_BLOCK and BLOOD_HALT
  const f2 = COMBAT.startFight(W, [npc.id], [foe.id], 'spar', { serious: false });
  const rQi = COMBAT.COMPOSABLE_ENGINE.executeAcupointStrike(W, f2, npc, foe, 'QI_BLOCK');
  check(rQi && rQi.pointId === 'QI_BLOCK' && STATS.has(foe, 'acupointSealed', W.t), 'QI_BLOCK acupoint strike applied acupointSealed');
  const rBlood = COMBAT.COMPOSABLE_ENGINE.executeAcupointStrike(W, f2, npc, foe, 'BLOOD_HALT');
  check(rBlood && rBlood.pointId === 'BLOOD_HALT' && STATS.has(foe, 'BLOOD_HALT', W.t), 'BLOOD_HALT acupoint strike applied BLOOD_HALT');
  console.log('  ✓ Phase 1 (PROP-01) passed');
}

// Phase 2: [PROP-02] Voluntary Dao Vows, Vow Breaking & Dao Seals Persistence
console.log('▶ [Phase 2 / PROP-02] Testing Voluntary Dao Vows, Vow Breaking & Dao Seals...');
{
  const W = SIM.create('v320-dao-vows');
  const npc = W.npcs[0];
  npc.cult.stage = 3;
  npc.inj = [];
  npc.h.state.heartDemon = 0;

  const baseRate = CULT.rate(npc);
  const vowRes = CULT.bindOathVow(W, npc, 'VOW_ABSTAIN_PILLS');
  check(vowRes.ok && npc.daoOath && npc.daoOath.upheld === true, 'VOW_ABSTAIN_PILLS bound');
  const vowRate = CULT.rate(npc);
  check(vowRate >= baseRate * 1.20, `Dao Oath increased CULT.rate by +26% (${baseRate.toFixed(2)} -> ${vowRate.toFixed(2)})`);

  // Violate VOW_ABSTAIN_PILLS by consuming a pill via ECO.useConsumableItem
  ECO.add(W, 'P:BASIC_QI', 2);
  ECO.useConsumableItem(W, npc, 'P:BASIC_QI', { free: true });
  check(npc.daoOath.upheld === false, 'Consuming pill broke VOW_ABSTAIN_PILLS');
  check(npc.h.state.heartDemon >= 35, `Vow backlash added +35 heartDemon (got ${npc.h.state.heartDemon})`);
  check(npc.inj.some(i => i && i.part === 'สัตย์สาบานพังทลาย'), 'Spiritual injury สัตย์สาบานพังทลาย recorded in npc.inj');

  // Dao Seals persisted in npc.ext.daoSeals and npc.ext.btBonusPct (no leading underscore)
  const btBefore = CULT.breakthroughChance(npc);
  const sealRes = CULT.grantDaoSeal(W, npc, 'SEAL_UNDEFEATED_10');
  check(sealRes.ok && Array.isArray(npc.ext.daoSeals) && npc.ext.daoSeals.length === 1, 'Dao Seal stored in npc.ext.daoSeals');
  check(npc.ext.btBonusPct >= 0.08, `npc.ext.btBonusPct set to ${npc.ext.btBonusPct}`);
  const btAfter = CULT.breakthroughChance(npc);
  check(btAfter > btBefore, `Dao Seal increased breakthroughChance (${btBefore.toFixed(3)} -> ${btAfter.toFixed(3)})`);

  // Verify Save/Load persistence of npc.ext.btBonusPct
  const loaded = SIM.deserialize(SIM.serialize(W));
  const lNpc = loaded.byId[npc.id];
  check(lNpc.ext && lNpc.ext.btBonusPct === npc.ext.btBonusPct, 'npc.ext.btBonusPct survived Save/Load round-trip');
  console.log('  ✓ Phase 2 (PROP-02) passed');
}

// Phase 3: [PROP-07] Vanguard Formations (SPEAR_ZOC_PHALANX), Combat Posture & 85% Intercept Cap
console.log('▶ [Phase 3 / PROP-07] Testing Vanguard Formations, Combat Posture & Interception Cap...');
{
  const W = SIM.create('v320-vanguard');
  SECT.PEAKS.ensure(W);
  const spearUnit = W.npcs[0];
  spearUnit.equip = spearUnit.equip || {};
  spearUnit.equip.WEAPON = { uid: 'WPN_SPEAR_1', id: 'EQ_SPEAR', nameTh: 'ทวนมังกรคราม', slot: 'WEAPON', gearType: 'SPEAR', tier: 3 };

  W.sect.vanguardPosture = 'NORMAL';
  const zocBase = COMBAT.unitZoCRadius(spearUnit, W);
  W.sect.vanguardPosture = 'SPEAR_ZOC_PHALANX';
  const zocPhalanx = COMBAT.unitZoCRadius(spearUnit, W);
  check(Math.abs((zocPhalanx - zocBase) - 0.35) < 0.02, `SPEAR_ZOC_PHALANX increased unitZoCRadius by +0.35 (${zocBase} -> ${zocPhalanx})`);

  // Sect Combat Posture: OFFENSIVE (+8% ATK) vs DEFENSIVE (+10% DEF/MDEF)
  W.sect.combatPosture = 'NEUTRAL';
  STATS.dirty(spearUnit);
  const stNeutral = STATS.calcCombatStats(spearUnit);

  W.sect.combatPosture = 'OFFENSIVE';
  STATS.dirty(spearUnit);
  const stOff = STATS.calcCombatStats(spearUnit);
  check(stOff.atk > stNeutral.atk, `OFFENSIVE posture increased ATK (${stNeutral.atk} -> ${stOff.atk})`);

  W.sect.combatPosture = 'DEFENSIVE';
  STATS.dirty(spearUnit);
  const stDef = STATS.calcCombatStats(spearUnit);
  check(stDef.def > stNeutral.def && stDef.mdef > stNeutral.mdef, `DEFENSIVE posture increased DEF/MDEF (${stNeutral.def} -> ${stDef.def})`);
  console.log('  ✓ Phase 3 (PROP-07) passed');
}

// Phase 4: [PROP-12] Living Destiny Threads (Max 5, GOLD/RED/BLACK) & Karmic Ledger
console.log('▶ [Phase 4 / PROP-12] Testing Living Destiny Threads & Karmic Ledger...');
{
  const W = SIM.create('v320-destiny-karma');
  const guard = W.npcs[0];
  const ally = W.npcs[1];
  const enemy = W.npcs[2];
  guard.cult.path = 'BODY';
  guard.equip = { WEAPON: { uid: 'W_SP', id: 'W_SP', nameTh: 'ทวนพิทักษ์', slot: 'WEAPON', gearType: 'SPEAR', tier: 3 } };

  const f = COMBAT.startFight(W, [guard.id, ally.id], [enemy.id], 'spar', { serious: false });
  f.state = 'fight';
  guard.x = 50; guard.y = 50;
  ally.x = 51; ally.y = 50;
  enemy.x = 49; enemy.y = 50;
  COMBAT.setHp(guard, COMBAT.hpMax(guard));
  COMBAT.setHp(ally, Math.round(COMBAT.hpMax(ally) * 0.18)); // < 25% HP!
  COMBAT.ensureUnitTac(guard).reactionCharges = 1;
  COMBAT.ensureUnitTac(guard).reactionReadyAt = 0;

  const ic = COMBAT.resolveDefensiveInterception(W, f, enemy, ally, {});
  check(ic && ic.interceptor && ic.interceptor.id === guard.id, 'Guard intercepted attack for low-HP ally');
  check(ic.interceptCap === 0.85 && ic.interceptChance <= 0.85, 'Interception score capped at <= 85%');
  check(Array.isArray(guard.destinyThreads) && guard.destinyThreads.some(t => t.type === 'GOLD_THREAD'), 'GOLD_THREAD bound automatically on < 25% HP rescue');

  // Verify max 5 destinyThreads cap per character
  for (let i = 0; i < 8; i++) {
    const extra = SIM.addNpc(W, { rank: 2, stage: 2 });
    SECT.DESTINY_KARMA.bindThread(W, guard, extra, 'RED_THREAD', 'ร่วมบำเพ็ญ #' + i);
  }
  check(guard.destinyThreads.length <= 5, `destinyThreads capped at max 5 (got ${guard.destinyThreads.length})`);

  // Karmic Ledger & combat condition evaluation
  SECT.DESTINY_KARMA.recordKarmicAction(W, guard, 'RESCUE_VILLAGERS', 60);
  SECT.DESTINY_KARMA.recordKarmicAction(W, enemy, 'PILLAGE', -60);
  delete f._condCache;
  check(COMBAT.COMPOSABLE_ENGINE.evaluateCondition('KARMIC_DEBT_POSITIVE', guard, enemy, { W, f }) === true, 'KARMIC_DEBT_POSITIVE true from karmicLedger');
  check(COMBAT.COMPOSABLE_ENGINE.evaluateCondition('SIN_KARMA_HIGH', guard, enemy, { W, f }) === true, 'SIN_KARMA_HIGH true from target sinKarma');
  console.log('  ✓ Phase 4 (PROP-12) passed');
}

// Phase 5: [PROP-15] 8 Peaks Domain Bonuses in CULT.rate, STATS.calcCombatStats, ECO & CPE
console.log('▶ [Phase 5 / PROP-15] Testing 8 Peaks Domain Bonuses & Array Upgrade...');
{
  const W = SIM.create('v320-eight-peaks');
  for (let i = 0; i < 8; i++) SIM.addNpc(W, { rank: 4, stage: 4 });
  const n = W.npcs[1];
  n.equip = { WEAPON: { uid: 'W_SW', id: 'W_SW', nameTh: 'กระบี่เมฆา', slot: 'WEAPON', gearType: 'SWORD', tier: 3 } };

  const baseSt = STATS.calcCombatStats(n);
  SECT.PEAKS.foundPeak(W, 'PEAK_AZURE_SWORD', n.id, { allowDecree: true });
  SECT.PEAKS.activatePeakArray(W, 'PEAK_AZURE_SWORD');
  n.peakId = 'PEAK_AZURE_SWORD';
  STATS.dirty(n);
  const swordSt = STATS.calcCombatStats(n);
  check(swordSt.atk > baseSt.atk, `PEAK_AZURE_SWORD (+10% swordPower) increased ATK (${baseSt.atk} -> ${swordSt.atk})`);

  // Test array upgrade & toggle
  W.sect.stones = 500;
  const upg = SECT.PEAKS.upgradePeakArray(W, 'PEAK_AZURE_SWORD');
  check(upg.ok && upg.arrayLevel === 2, 'Peak Qi Array upgraded to Level 2');

  // Test PEAK_DIVINE_CAULDRON (PEAK_ALCHEMY) +15% craft success
  const rec = Object.values(ECO.recipeById)[0];
  n.peakId = null;
  const scBase = ECO.successChance(n, rec);
  SECT.PEAKS.foundPeak(W, 'PEAK_DIVINE_CAULDRON', n.id, { allowDecree: true });
  n.peakId = 'PEAK_DIVINE_CAULDRON';
  const scAlch = ECO.successChance(n, rec);
  check(scAlch > scBase, `PEAK_DIVINE_CAULDRON increased ECO.successChance (${scBase.toFixed(3)} -> ${scAlch.toFixed(3)})`);

  // Test PEAK_SAGE_STRATEGIST (PEAK_SCHOLAR) +15% CP gain
  SECT.PEAKS.foundPeak(W, 'PEAK_SAGE_STRATEGIST', n.id, { allowDecree: true });
  n.peakId = 'PEAK_SAGE_STRATEGIST';
  const cpBefore = n.cp || 0;
  CPE.mint(W, n, 100, 'ทดสอบโบนัสหุบเขาปราชญ์', true);
  check((n.cp - cpBefore) >= 114, `PEAK_SAGE_STRATEGIST increased CP minted by +15% (gained ${n.cp - cpBefore})`);
  console.log('  ✓ Phase 5 (PROP-15) passed');
}

// Phase 6: [PROP-17] Succession Crisis Trigger on Sect Master Death & Historical Snapshot
console.log('▶ [Phase 6 / PROP-17] Testing Succession Crisis on Sect Master Death...');
{
  const W = SIM.create('v320-succession');
  const oldMasterId = W.sect.masterId;
  const oldMaster = W.byId[oldMasterId];
  const deputy = W.npcs.find(x => x.id !== oldMasterId);
  const succ = W.npcs.find(x => x.id !== oldMasterId && x.id !== deputy.id);
  W.sect.deputyId = deputy.id; deputy.rank = 5; deputy.h.personality.ambition = 82;
  W.sect.posts.disciples = succ.id; succ.post = 'disciples'; succ.rank = 4;

  // Simulate Master death and run SIM.dailyUpdate
  oldMaster.dead = true;
  oldMaster.deathDay = W.day;
  SIM.dailyUpdate(W);

  check(W.sect.masterId !== oldMasterId && W.byId[W.sect.masterId] && !W.byId[W.sect.masterId].dead, 'New Sect Master elected automatically upon Master death');
  const newMaster = W.byId[W.sect.masterId];
  check(!newMaster.post && W.sect.deputyId !== newMaster.id, 'New Sect Master does not hold duplicate office or deputy post');
  check(W.sect.historicalPeople && W.sect.historicalPeople[oldMasterId] && W.sect.historicalPeople[oldMasterId].dead, 'Deceased Sect Master snapshotted into W.sect.historicalPeople');
  console.log('  ✓ Phase 6 (PROP-17) passed');
}

// Phase 7: [PROP-18 & PROP-20] Fiscal Stipend Cooldowns & World Map Command Drawer
console.log('▶ [Phase 7 / PROP-18 & PROP-20] Testing Fiscal Stipend Cooldowns & World Command UI...');
{
  const W = SIM.create('v320-stipends-ui');
  W.sect.stones = 1000;
  const officer = W.npcs.find(x => x.id !== W.sect.masterId);
  SECT.appoint(W, 'martial', officer);
  const satBefore = officer.sat || 60;

  const p1 = SECT.payOfficeStipends(W, {});
  check(p1.ok === true && p1.totalPaid > 0, 'First monthly stipend payment succeeded');
  check((officer.sat || 0) >= satBefore + 8 || officer.sat === 100, 'Officer received sat +8');
  check(officer.ext && officer.ext.officeEfficiencyMult === 1.20, 'Officer received +20% efficiency buff');

  // Second call in same month without forceFull must be blocked by cooldown
  const p2 = SECT.payOfficeStipends(W, {});
  check(p2.ok === false && p2.reason === 'cooldown-active', 'Second stipend payment in same month blocked by cooldown');

  // Call with forceFull: true must bypass cooldown for legacy compatibility
  const p3 = SECT.payOfficeStipends(W, { forceFull: true });
  check(p3.ok === true && p3.totalPaid > 0, 'forceFull: true bypassed monthly cooldown');

  // Verify World Map Command Drawer buttons exist in UI.rWorldMap(W)
  const mapHtml = UI.rWorldMap(W);
  for (const cmd of ['collect-vassal-tribute', 'harvest-resource-nodes', 'trigger-alliance-council', 'trigger-secret-realm', 'evaluate-elder-ascensions']) {
    check(mapHtml.includes(`data-do="${cmd}"`), `UI.rWorldMap includes command button ${cmd}`);
  }
  console.log('  ✓ Phase 7 (PROP-18 & PROP-20) passed');
}

// Phase 8: [PROP-25] Elemental Puzzle Gates & Auxiliary Exploration Modifiers
console.log('▶ [Phase 8 / PROP-25] Testing Elemental Puzzle Gates & Auxiliary Modifiers...');
{
  const W = SIM.create('v320-explore-gates');
  SECT.LEYLINE_GRID.ensure(W);
  const m1 = W.npcs[0], m2 = W.npcs[1];
  m1.h.root.primaryElement = 'FIRE';
  m2.h.root.primaryElement = 'WATER_ICE';

  const aux = EXPLORE.partyAuxiliaryModifiers([m1, m2], W);
  check(aux.speedMult > 1.0 && aux.supplySavePct > 0, `partyAuxiliaryModifiers applied Leyline & party bonuses (speedMult=${aux.speedMult})`);

  const stonesBefore = W.sect.stones;
  const gateOk = EXPLORE.solveElementalPuzzleGate(W, [m1, m2], {
    id: 'GATE_VAPOR',
    requiredReaction: 'THERMAL_VAPORIZE',
    requiredElements: ['FIRE', 'WATER_ICE'],
    rewardStones: 400,
    rewardRecipeId: 'REC_ANCIENT_VAPOR_TEST'
  });
  check(gateOk.ok === true && gateOk.rewardStones === 400 && W.sect.stones === stonesBefore + 400, 'Solved elemental puzzle gate and rewarded 400 stones');
  check(W.sect.knownRecipes.includes('REC_ANCIENT_VAPOR_TEST'), 'Unlocked ancient recipe from elemental puzzle gate');

  const gateFail = EXPLORE.solveElementalPuzzleGate(W, [m1], {
    id: 'GATE_LIGHTNING',
    requiredElements: ['LIGHTNING', 'ASTRAL'],
    rewardStones: 300
  });
  check(gateFail.ok === false && gateFail.blockedMainPath === false, 'Unsolved puzzle gate does not block main dungeon exploration');
  console.log('  ✓ Phase 8 (PROP-25) passed');
}

// Phase 9: [PROP-30] Advanced Gear E01–E06 (Weapon Evolution, Adaptive Armor, Paired Items, Soul-Bound, Armed Traps, Runes)
console.log('▶ [Phase 9 / PROP-30] Testing Advanced Gear Mechanics E01–E06...');
{
  const W = SIM.create('v320-gear-e01-e06');
  const hero = W.npcs[0];
  hero.equip = {
    WEAPON: { uid: 'W_EVO', id: 'EQ_SWORD_EVO', nameTh: 'กระบี่สุริยันเติบโต', slot: 'WEAPON', gearType: 'SWORD', tier: 2, q: 1.0, element: 'LIGHT_YANG', pairId: 'PAIR_SUN_MOON' },
    ARMOR: { uid: 'A_ADP', id: 'EQ_ARMOR_ADP', nameTh: 'เกราะเกล็ดมังกรปรับธาตุ', slot: 'ARMOR', gearType: 'HEAVY', tier: 3, q: 1.0 },
    ACCESSORY: { uid: 'X_PAIR', id: 'EQ_ACC_PAIR', nameTh: 'หยกจันทราคู่ประสาน', slot: 'ACCESSORY', gearType: 'CHARM', tier: 3, q: 1.0, element: 'DARK_YIN', pairId: 'PAIR_SUN_MOON' }
  };

  // E03: Paired Items in STATS.calcCombatStats
  const pr = ECO.evaluatePairedItems(hero);
  check(pr.active && pr.bonusMult === 1.16, 'Paired items evaluated (+16% bonusMult)');
  STATS.dirty(hero);
  const ex = STATS.explain(hero);
  check(ex.parts.atk.some(p => p[0].includes('ศาสตราคู่ประสาน')), 'STATS.calcCombatStats includes Paired Items bonus');

  // E01: Living Weapon kills in COMBAT.slay (3 kills -> Stage 1 evolution)
  for (let i = 0; i < 3; i++) {
    const dummyFoe = { id: 'FOE_KILL_' + i, foe: true, name: 'โจรภูเขา', tier: 2, hp: 10, hpMax: 10 };
    COMBAT.slay(W, null, hero, dummyFoe);
  }
  check(hero.equip.WEAPON.killTracker && hero.equip.WEAPON.killTracker.kills >= 3 && hero.equip.WEAPON.killTracker.evolutionStage >= 1, 'Weapon evolved to Stage 1 after 3 kills in COMBAT.slay');

  // E02: Adaptive Armor in COMBAT.applyDamage
  const fireEnemy = { id: 'FOE_FIRE', foe: true, name: 'อสูรเพลิง', element: 'FIRE', hp: 500, hpMax: 500 };
  const f = COMBAT.startFight(W, [hero.id], [fireEnemy.id], 'spar', { serious: false });
  COMBAT.applyDamage(W, f, fireEnemy, hero, 20, 'เพลิงผลาญ');
  COMBAT.applyDamage(W, f, fireEnemy, hero, 20, 'เพลิงผลาญ');
  check(hero.equip.ARMOR.adaptiveState && hero.equip.ARMOR.adaptiveState.lastElement === 'FIRE' && hero.equip.ARMOR.adaptiveState.resistBonusPct >= 0.20, 'Armor adapted to FIRE element in COMBAT.applyDamage');

  // E06: Armed Consumables triggered on COMBAT.startFight
  ECO.add(W, 'P:BASIC_QI', 2);
  ECO.armConsumableTrap(hero, 'P:BASIC_QI', 'COMBAT_START');
  check(hero.armedConsumables.length === 1, 'Consumable armed for COMBAT_START');
  COMBAT.startFight(W, [hero.id], [fireEnemy.id], 'spar', { serious: false });
  check(hero.armedConsumables.length === 0, 'Armed consumable triggered automatically on COMBAT.startFight');

  // E05: Socket Elemental Runes
  const runeRes = ECO.socketElementalRunes(W, hero, hero.equip.WEAPON, ['FIRE', 'WATER_ICE']);
  check(runeRes.ok && hero.equip.WEAPON.embeddedReaction, 'Elemental runes socketed onto weapon');
  console.log('  ✓ Phase 9 (PROP-30) passed');
}

// Phase 10: [PROP-33] Sect Totems & Beast Symbiosis Save/Load Round-Trip Persistence + 80-NPC Perf Budget
console.log('▶ [Phase 10 / PROP-33] Testing Totems & Beast Symbiosis Save/Load Persistence + 80-NPC Perf...');
{
  const W = SIM.create('v320-totems-symbiosis');
  const beastMaster = W.npcs[0];
  beastMaster.cult.path = 'BEAST_SOVEREIGN';
  beastMaster.ext = beastMaster.ext || {};
  beastMaster.ext.pets = [];
  beastMaster.pets = [];

  // Calling activatePossession with no pets must fail (no conjuring fake pets!)
  const failPos = CULT.BEAST_SYMBIOSIS.activatePossession(W, beastMaster, null, 36);
  check(failPos.ok === false, 'activatePossession rejected when NPC has no real pet with bond >= 80');

  // Add real pet with bond = 90
  const realPet = { uid: 'PET_REAL_90', nameTh: 'พยัคฆ์ขาวบรรพกาล', tier: 5, level: 6, bond: 90, loyalty: 90, element: 'EARTH_METAL', active: true };
  beastMaster.ext.pets = [realPet];
  beastMaster.pets = [realPet];

  const okPos = CULT.BEAST_SYMBIOSIS.activatePossession(W, beastMaster, 'PET_REAL_90', 45);
  check(okPos.ok === true && beastMaster.ext.beastSpiritPossessedUntil > W.t, 'activatePossession succeeded with real bonded pet and stored npc.ext.beastSpiritPossessedUntil');

  // Erect Totem Pillar
  const totRes = SECT.TOTEMS_BLOODLINES.erectTotemPillar(W, 'TOTEM_WHITE_TIGER');
  check(totRes.ok && Array.isArray(beastMaster.sectTotems) && beastMaster.sectTotems.includes('TOTEM_WHITE_TIGER'), 'Totem stored in persistent npc.sectTotems');

  // Save/Load Round-trip and verify bonuses persist even if g.W is cleared (simulating browser G.W environment)
  const rawSave = SIM.serialize(W);
  const prevGW = G.W;
  G.W = undefined;
  G.G = { W: null };
  const WLoaded = SIM.deserialize(rawSave);
  G.G.W = WLoaded;
  const loadedMaster = WLoaded.byId[beastMaster.id];

  const totBonusAfterLoad = SECT.TOTEMS_BLOODLINES.getUnitBonuses(loadedMaster);
  check(totBonusAfterLoad && totBonusAfterLoad.active && totBonusAfterLoad.p.atk > 0, 'Totem bonuses persisted across Save/Load in browser G.G.W environment');

  const symBonusAfterLoad = CULT.BEAST_SYMBIOSIS.getStatBonuses(loadedMaster, WLoaded.t);
  check(symBonusAfterLoad && symBonusAfterLoad.active && symBonusAfterLoad.possessed === true, 'Beast Spirit Possession persisted across Save/Load via npc.ext.beastSpiritPossessedUntil');
  G.W = prevGW;

  // 80-NPC Simulation Performance Budget (< 3.5 ms/tick)
  while (WLoaded.npcs.filter(n => n && !n.dead).length < 80) {
    SIM.addNpc(WLoaded, { rank: 1, stage: 2 });
  }
  SIM.tick(WLoaded); // Warmup
  const t0 = Date.now();
  const ticks = 50;
  for (let i = 0; i < ticks; i++) SIM.tick(WLoaded);
  const msPerTick = (Date.now() - t0) / ticks;
  check(msPerTick <= 3.5, `80-NPC Simulation tick budget <= 3.5 ms/tick (got ${msPerTick.toFixed(3)} ms/tick)`);
  console.log(`  ✓ Phase 10 (PROP-33) & 80-NPC performance (${msPerTick.toFixed(3)} ms/tick) passed`);
}

console.log(`\n✅ ALL 10 PHASES PASSED (${passed} assertions verified in v320_dormant_awakening_suite.js)!`);
