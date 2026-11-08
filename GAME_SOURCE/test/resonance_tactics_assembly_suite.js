'use strict';
const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const G = require('./load.js');
const { HC, CULT, MARTIAL, STATS, JD, ECO, COMBAT, SK, SECT, SIM } = G;

const ROOT = path.resolve(__dirname, '..');

console.log('=== Running Resonance, Tactics & Grand Assembly Suite (v2.0.5) ===');

// 0. Hard Invariant: human_core.js byte-for-byte SHA-256 lock
const hcBytes = fs.readFileSync(path.join(ROOT, 'js/human_core.js'));
const hcSha = crypto.createHash('sha256').update(hcBytes).digest('hex');
assert.strictEqual(
  hcSha,
  'a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542',
  'human_core.js must remain byte-for-byte identical'
);
assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7', 'HC.FINGERPRINT must remain 155:2f9c9dd7');
console.log('  PASS: human_core.js byte-for-byte lock verified (155:2f9c9dd7)');

// 1. Pillar A: Baseline + Nine-Dao equipment resonance sets (31 sets, 96 subpaths, T3-T7)
assert(Array.isArray(MARTIAL.RESONANCE_SETS), 'MARTIAL.RESONANCE_SETS must be an array');
assert.strictEqual(MARTIAL.RESONANCE_SETS.filter(s => !s.id.startsWith('RES_NINE_DAO_')).length, 19, 'Must preserve all 19 baseline resonance sets');
assert.strictEqual(MARTIAL.RESONANCE_SETS.filter(s => s.id.startsWith('RES_NINE_DAO_')).length, 43, 'Must register all 43 Pagoda resonance sets');
assert.strictEqual(MARTIAL.RESONANCE_SETS.length, 62, 'Must have 31 baseline plus Pagoda resonance sets');

const coveredSubpaths = new Set();
for (const set of MARTIAL.RESONANCE_SETS) {
  assert(set.id && typeof set.id === 'string', 'Set must have a string id');
  assert(set.nameTh && typeof set.nameTh === 'string', `Set ${set.id} must have nameTh`);
  assert(Array.isArray(set.subpaths) && set.subpaths.length > 0, `Set ${set.id} must define subpaths`);
  assert(set.slots && set.slots.WEAPON && set.slots.ARMOR && set.slots.ACCESSORY, `Set ${set.id} must define slots`);
  assert(set.bonus2 && typeof set.bonus2 === 'object', `Set ${set.id} must define bonus2`);
  assert(set.bonus3 && typeof set.bonus3 === 'object', `Set ${set.id} must define bonus3`);
  assert(set.bonus3.rider && typeof set.bonus3.rider === 'object', `Set ${set.id} bonus3 must have rider`);
  set.subpaths.forEach(s => coveredSubpaths.add(s));
}

// Every current subpath must retain equipment resonance coverage.
let totalKnownSubpaths = 0;
for (const p of Object.keys(CULT.PATHS)) {
  for (const s of CULT.PATHS[p].subPaths || []) {
    totalKnownSubpaths++;
    assert(coveredSubpaths.has(s.id), `Subpath ${s.id} not covered by any resonance set!`);
  }
}
assert.strictEqual(totalKnownSubpaths, 286, 'Total subpaths in system must be 132');
console.log('  PASS: 31 resonance sets verified covering all 96 subpaths');

// Test evaluateResonanceSet functionality
const W = SIM.create('test-resonance-suite');
const npc = W.npcs[0];
assert(npc, 'Must have at least one test NPC');

// Empty gear evaluation
const emptyEval = MARTIAL.evaluateResonanceSet(npc);
assert.strictEqual(emptyEval.active, false, 'Empty gear must have active=false');
assert.strictEqual(emptyEval.pieces, 0, 'Empty gear must have 0 pieces');

// Equip 2 pieces of a set using actual minted items
const testSet = MARTIAL.RESONANCE_SETS.find(s => s.id === 'RES_PURE_SWORD_SAINT');
npc.cult.path = testSet.path;
npc.cult.sub = testSet.subpaths[0];

const swordItem = JD.ITEMS.items.find(it => it.resonanceSetId === 'RES_PURE_SWORD_SAINT' && it.slot === 'WEAPON');
const armorItem = JD.ITEMS.items.find(it => it.resonanceSetId === 'RES_PURE_SWORD_SAINT' && it.slot === 'ARMOR');
const accItem = JD.ITEMS.items.find(it => it.resonanceSetId === 'RES_PURE_SWORD_SAINT' && it.slot === 'ACCESSORY');

assert(swordItem && armorItem && accItem, 'Must find valid real items for RES_PURE_SWORD_SAINT');

const sword = ECO.mintGear(swordItem, 1);
const armor = ECO.mintGear(armorItem, 1);
const acc = ECO.mintGear(accItem, 1);

npc.equip = { WEAPON: sword, ARMOR: armor };
if (MARTIAL.invalidateMartialCaches) MARTIAL.invalidateMartialCaches(npc);

const eval2 = MARTIAL.evaluateResonanceSet(npc);
assert.strictEqual(eval2.active, true, '2 matching pieces must activate resonance');
assert.strictEqual(eval2.pieces, 2, 'Must recognize 2 pieces');
assert.strictEqual(eval2.setId, testSet.id, `Must match set ${testSet.id}`);
assert.strictEqual(eval2.isSubpathMatch, true, 'Subpath must match');
assert(eval2.avgTier >= 3, 'Average tier should be >= 3');

// Equip 3 pieces (Complete set)
npc.equip.ACCESSORY = acc;
if (MARTIAL.invalidateMartialCaches) MARTIAL.invalidateMartialCaches(npc);

const eval3 = MARTIAL.evaluateResonanceSet(npc);
assert.strictEqual(eval3.active, true, '3 matching pieces must activate resonance');
assert.strictEqual(eval3.pieces, 3, 'Must recognize 3 pieces');
assert(eval3.rider, '3 pieces must activate set rider');
assert(typeof eval3.summaryTh === 'string' && eval3.summaryTh.length > 0, 'Must produce summaryTh');

// Test preview upgrade
const prospectiveItem = JD.ITEMS.items.find(it => it.resonanceSetId === 'RES_PURE_SWORD_SAINT' && it.slot === 'ACCESSORY' && (it.tier || 1) >= 4) || accItem;
const preview = MARTIAL.resonanceUpgradePreview(npc, prospectiveItem);
assert(preview, 'resonanceUpgradePreview must return an object');

// Test STATS integration
const stats = STATS.get(npc);
assert(stats && typeof stats.atk === 'number', 'STATS.get must succeed with resonance set');
const exp = STATS.explain(npc);
assert(exp && typeof exp === 'object', 'STATS.explain must return explanation with resonance');
console.log('  PASS: evaluateResonanceSet 2-piece and 3-piece evaluation & STATS integration verified');

// New specializations share real baseline traditions without increasing their bonuses.
for (const sub of JD.MARTIAL.subPaths.filter(s => s.v214)) {
  const baseSet = MARTIAL.RESONANCE_SETS.find(s => !s.id.startsWith('RES_NINE_DAO_') && s.subpaths.includes(sub.id));
  assert(baseSet, 'Existing baseline tradition covers ' + sub.id);
  const profile = MARTIAL.PROFILES[sub.id];
  assert(baseSet.slots.WEAPON.some(w => profile[3].includes(w)), 'Baseline weapon fits ' + sub.id);
  assert(baseSet.slots.ARMOR.some(a => profile[4].includes(a)), 'Baseline armor fits ' + sub.id);
}
// Real Pagoda reward pieces activate exactly their own three-piece set for all
// new-path branches and all three craft specialists; one item still counts once.
for (const pathId of ['ARRAY_TALISMAN', 'STRATEGY_GOVERNANCE', 'CRAFT_CREATION']) {
  const pieces = G.EXPLORE.pagodaSetPieces(pathId, 1);
  assert.strictEqual(pieces.length, 3, 'Three reward pieces for ' + pathId);
  assert.strictEqual(new Set(pieces.map(p => p.uid)).size, 3, 'Distinct reward identities for ' + pathId);
  for (const sub of CULT.PATHS[pathId].subPaths.filter(s => s.v214)) {
    const subject = JSON.parse(JSON.stringify(W.npcs[1]));
    subject.cult = { path: pathId, sub: sub.id, stage: 5, prog: 0, techs: [] };
    subject.equip = { WEAPON: pieces[0] };
    MARTIAL.invalidateMartialCaches(subject);
    assert.strictEqual(MARTIAL.evaluateResonanceSet(subject).active, false, 'One real piece cannot activate ' + sub.id);
    subject.equip.ARMOR = pieces[1];
    MARTIAL.invalidateMartialCaches(subject);
    assert.strictEqual(MARTIAL.evaluateResonanceSet(subject).pieces, 2, 'Two occupied slots count twice for ' + sub.id);
    subject.equip.ACCESSORY = pieces[2];
    MARTIAL.invalidateMartialCaches(subject);
    const activated = MARTIAL.evaluateResonanceSet(subject);
    assert.strictEqual(activated.setId, 'RES_NINE_DAO_' + pathId);
    assert.strictEqual(activated.pieces, 3, 'Three occupied slots count three times for ' + sub.id);
    assert.strictEqual(activated.isSubpathMatch, true, 'Reward recognizes subpath ' + sub.id);
    assert(activated.rider, 'Three pieces unlock rider for ' + sub.id);
  }
}
console.log('  PASS: new specialist baseline coverage and exact Pagoda piece activation');


// 2. Pillar B: Tactical Weapon AI (7 Weapon Families, Stances, Counter-AI)
assert(SK.WEAPON_TACTICS, 'SK.WEAPON_TACTICS must exist');
const weaponTypes = ['SPEAR', 'STAFF', 'BOW', 'FOCUS', 'BLADE', 'FIST', 'SWORD'];
for (const wt of weaponTypes) {
  assert(SK.WEAPON_TACTICS[wt], `Tactics missing for weapon family ${wt}`);
  assert(SK.WEAPON_TACTICS[wt].reachClass, `reachClass missing for ${wt}`);
  assert(SK.WEAPON_TACTICS[wt].nameTh, `nameTh missing for ${wt}`);
}

const targetNpc = W.npcs[1];
assert(targetNpc, 'Must have second test NPC for tactics');

// Test resolveWeaponTactics: Long-reach (SPEAR) vs Short-reach (FIST)
npc.equip.WEAPON = { slot: 'WEAPON', gearType: 'SPEAR', weaponType: 'SPEAR', tier: 4, nameTh: 'ทวนศึก' };
targetNpc.equip = targetNpc.equip || {};
targetNpc.equip.WEAPON = { slot: 'WEAPON', gearType: 'FIST', weaponType: 'FIST', tier: 4, nameTh: 'สนับหมัด' };
if (MARTIAL.invalidateMartialCaches) {
  MARTIAL.invalidateMartialCaches(npc);
  MARTIAL.invalidateMartialCaches(targetNpc);
}

const tacSpear = COMBAT.resolveWeaponTactics(npc, targetNpc, { dist: 2.2 });
assert(tacSpear, 'resolveWeaponTactics must return tactical result');
assert.strictEqual(tacSpear.relation, 'POLEARM_FIRST_STRIKE', 'Spear at range must trigger POLEARM_FIRST_STRIKE');
assert.strictEqual(tacSpear.attackerWeapon, 'SPEAR');
assert.strictEqual(tacSpear.defenderWeapon, 'FIST');
assert(tacSpear.dmgMult >= 1.10, 'Spear at range should have >= 1.10 dmgMult');

// Test Bow vs melee at distance
npc.equip.WEAPON = { slot: 'WEAPON', gearType: 'BOW', weaponType: 'BOW', tier: 4, nameTh: 'คันศรศึก' };
if (MARTIAL.invalidateMartialCaches) MARTIAL.invalidateMartialCaches(npc);
const tacBow = COMBAT.resolveWeaponTactics(npc, targetNpc, { dist: 4.5 });
assert.strictEqual(tacBow.relation, 'RANGED_KITING_ADVANTAGE', 'Bow at distance must trigger RANGED_KITING_ADVANTAGE');
assert.strictEqual(tacBow.attackerWeapon, 'BOW');
assert(tacBow.dmgMult > 1.0, 'Bow at long distance must gain kiting damage multiplier');

// Test Blade vs Guard
npc.equip.WEAPON = { slot: 'WEAPON', gearType: 'BLADE', weaponType: 'BLADE', tier: 4, nameTh: 'ดาบใหญ่ผ่าศิลา' };
targetNpc.equip.WEAPON = { slot: 'WEAPON', gearType: 'SWORD', weaponType: 'SWORD', tier: 4, nameTh: 'กระบี่' };
STATS.addStatus(targetNpc, 'guardUp', 5);
if (MARTIAL.invalidateMartialCaches) {
  MARTIAL.invalidateMartialCaches(npc);
  MARTIAL.invalidateMartialCaches(targetNpc);
}
const tacBlade = COMBAT.resolveWeaponTactics(npc, targetNpc);
assert.strictEqual(tacBlade.relation, 'HEAVY_GUARD_SHATTER', 'Blade vs guard must trigger HEAVY_GUARD_SHATTER');
assert.strictEqual(tacBlade.attackerWeapon, 'BLADE');
assert(tacBlade.shieldBreakMult > 1.0, 'Blade vs defensive guard must have shieldBreakMult > 1.0');
assert.strictEqual(tacBlade.shatterGuard, true, 'Blade must shatter guard');

// Test explainTactics
const explain = COMBAT.explainTactics(npc, targetNpc);
assert(explain && typeof explain === 'object', 'explainTactics must return object');
assert.strictEqual(explain.weaponType, 'BLADE');
assert(typeof explain.nameTh === 'string' && explain.nameTh.length > 0, 'explainTactics must have nameTh');
console.log('  PASS: Tactical Weapon AI (7 weapon families, kiting, guard-shatter, polearm advantage) verified');

// 3. Pillar C: Grand Sect Martial Assembly (3 Brackets, Bout Simulation, Rewards)
assert(SECT.ASSEMBLY_BRACKETS, 'SECT.ASSEMBLY_BRACKETS must exist');
assert(SECT.ASSEMBLY_BRACKETS.JUNIOR, 'JUNIOR bracket missing');
assert(SECT.ASSEMBLY_BRACKETS.CORE, 'CORE bracket missing');
assert(SECT.ASSEMBLY_BRACKETS.ELDER_PEAK, 'ELDER_PEAK bracket missing');

// Verify tournament announcement
const master = W.byId[W.sect.masterId] || W.npcs[0];
const tourney = SECT.tournament(W, master);
assert(tourney, 'SECT.tournament must initialize tournament');
assert.strictEqual(tourney.isGrandAssembly, true, 'Tournament must be marked as isGrandAssembly');
assert.deepStrictEqual(tourney.brackets, ['JUNIOR', 'CORE', 'ELDER_PEAK'], 'Must include all 3 brackets');

// Test signatureVictoryOf
const sig = SECT.signatureVictoryOf(npc);
assert(sig.weaponType, 'Signature victory must have weaponType');
assert(sig.weaponNameTh, 'Signature victory must have weaponNameTh');
assert(sig.moveNameTh, 'Signature victory must have moveNameTh');

// Test tailoredAssemblyReward
const reward = SECT.tailoredAssemblyReward(W, npc, 3, 5);
assert(reward, 'tailoredAssemblyReward must return reward object');
assert(reward.item, 'tailoredAssemblyReward must mint tailored gear item');

// Test bout simulation
const bout = SECT.simulateAssemblyBout(W, npc, targetNpc);
assert(bout.winner, 'simulateAssemblyBout must determine a winner');
assert(bout.loser, 'simulateAssemblyBout must determine a loser');
assert(bout.signature && bout.signature.moveNameTh, 'simulateAssemblyBout must identify signature move');

// Test full assembly run
const asmRes = SECT.assembly(W, master);
assert(asmRes.ok, 'SECT.assembly must succeed');
assert(asmRes.assembly, 'SECT.assembly must return assembly record');
assert(Array.isArray(asmRes.brackets) && asmRes.brackets.length > 0, 'Must have competed brackets');
assert(asmRes.champion, 'Must determine a grand champion');
assert(typeof asmRes.assembly.summaryTh === 'string' && asmRes.assembly.summaryTh.length > 0, 'Must have summaryTh');
assert(W.sect.assemblyHistory && W.sect.assemblyHistory.length > 0, 'History must be recorded in W.sect.assemblyHistory');
console.log('  PASS: Grand Sect Martial Assembly (3 brackets, tailored rewards, history recording) verified');

console.log('=== All Resonance, Tactics & Grand Assembly Tests Passed! (PASS) ===');
