'use strict';
const assert = require('assert');
const g = require('./load.js');
const { SIM, SECT, CULT, COMBAT, EXPLORE, AI, STATS } = g;

console.log('Running v2.0.9 + Deep Audit Verification Suite...');

// 1. Verify all 14 Sect Archetypes cover all 9 major paths with valid canonical subpaths
const expectedArchPaths = {
  sword: 'XIAN', blade: 'BODY', spear: 'BODY', fist: 'BODY', alchemy: 'XIAN',
  bow: 'XIAN', staff: 'BODY', focus: 'HEART_SOUL', god: 'GOD', demon: 'DEMON',
  mech: 'MECH_PUPPET', karma: 'KARMA_SAMSARA', beast: 'BEAST_SOVEREIGN', sage: 'SAGE_SUPPORT'
};
for (const [archId, expPath] of Object.entries(expectedArchPaths)) {
  const arch = SECT.ARCHETYPES[archId];
  assert(arch, `Missing SECT.ARCHETYPES.${archId}`);
  assert.strictEqual(arch.path, expPath, `Archetype ${archId} path mismatch`);
  for (const subId of arch.subs) {
    const found = Object.keys(CULT.PATHS).some(pk => {
      const si = CULT.subInfo(pk, subId);
      return si && si.nameTh && si.nameTh !== 'ยังไม่แยกสาย';
    });
    assert(found, `Archetype ${archId} has invalid subpath ${subId}`);
  }
  const W = SIM.create(2090 + archId.length, { masterIdx: 0, archetype: archId });
  const m = W.byId[W.sect.masterId];
  assert.strictEqual(m.cult.path, expPath, `Master of ${archId} should awaken in ${expPath}`);
  const expStage = (expPath === 'BODY' || expPath === 'GOD') ? 2 : 3;
  assert.strictEqual(m.cult.stage, expStage, `Master of ${archId} (${expPath}) should start at stage ${expStage}`);
  if (expStage === 3) assert.strictEqual(CULT.effectiveTechStage(m), 3, `Master of ${archId} should have effectiveTechStage === 3`);
}

// 2. Specialist Sect Facilities (mech_workshop, beast_menagerie, harmonic_pavilion)
const W = SIM.create(2091, { masterIdx: 0, archetype: 'sage' });
W.sect.stones = 50000;
const facs = SECT.ensureSpecialistFacilities(W);
assert(facs.mech_workshop && facs.beast_menagerie && facs.harmonic_pavilion, 'All 3 specialist facilities must exist');
for (const fid of ['mech_workshop', 'beast_menagerie', 'harmonic_pavilion']) {
  const up1 = SECT.upgradeSpecialistFacility(W, fid);
  assert(up1.ok && facs[fid].level === 2, `Should upgrade ${fid} to Lv.2`);
  const up2 = SECT.upgradeSpecialistFacility(W, fid);
  assert(up2.ok && facs[fid].level === 3, `Should upgrade ${fid} to Lv.3`);
}

// 3. Spirit Beast Breeding, Bloodline Awakening & Field Synchronization
const beastNpc = SIM.addNpc(W, { ageYears: 22, quality: 0.85, rank: 3, stage: 4 }); beastNpc.cult.path = 'BEAST_SOVEREIGN';
const pA = CULT.createPetRecord(W, beastNpc, 'BEAST_AZURE_WOLF_2', { active: true });
const pB = CULT.createPetRecord(W, beastNpc, 'BEAST_FLAME_TIGER_3', { active: true });
beastNpc.pets = [pA, pB];
CULT.ensurePets(beastNpc);
pA.hunger = 90; pA.satisfaction = 90; pA.fatigue = 0;
pB.hunger = 90; pB.satisfaction = 90; pB.fatigue = 0;
const breedRes = CULT.breedBeasts(W, pA, pB, { breederId: beastNpc.id, bindToBreeder: true });
assert(breedRes && breedRes.ok && breedRes.child, 'Spirit beast breeding should succeed');
const awkRes = CULT.awakenBloodline(W, beastNpc, pA.uid, { free: true });
assert(awkRes && awkRes.ok && pA.sovereignAwakened === true && pA.growthStage === 4, 'Bloodline awakening should set sovereignAwakened and growthStage 4');

// Verify EDITOR.applyPetAction field synchronization
SECT.EDITOR.applyPetAction(W, beastNpc.id, { action: 'update_pet', petId: pA.uid, loyalty: 97, satisfaction: 94, growthStage: 3, bondXp: 88 });
CULT.ensurePets(beastNpc);
assert.strictEqual(pA.loyalty, 97, 'Edited loyalty must persist across ensurePets');
assert.strictEqual(pA.bond, 97, 'Bond must sync with edited loyalty');
assert.strictEqual(pA.satisfaction, 94, 'Edited satisfaction must persist across ensurePets');

// 4. Formation Synergies, Support Doctrine & Harmonic Pavilion Scaling
const mechNpc = SIM.addNpc(W, { ageYears: 24, quality: 0.8, rank: 2, stage: 3 }); mechNpc.cult.path = 'MECH_PUPPET';
const karmaNpc = SIM.addNpc(W, { ageYears: 25, quality: 0.8, rank: 2, stage: 3 }); karmaNpc.cult.path = 'KARMA_SAMSARA';
const sageNpc = W.byId[W.sect.masterId];
const syn = COMBAT.evaluateFormationSynergy([sageNpc, beastNpc, mechNpc, karmaNpc]);
assert(syn && syn.synergies && syn.synergies.length >= 4, 'Multi-path party should activate formation synergies');

// Verify karma debt spending synchronization
const ks = CULT.ensureKarmaState(karmaNpc);
ks.debtPool = 100; ks.karmicDebt = 100;
karmaNpc.cult.sub = 'ASURA_JUDGMENT_BLADE';
const foe = { id: 'f_test', foe: true, nameTh: 'หุ่นทดสอบ', hp: 500, hpMax: 500, power: 30, tier: 2, x: 50, y: 50, sx: [] };
W.foeById = W.foeById || {}; W.foeById[foe.id] = foe;
COMBAT.strike(W, { id: 99, serious: true, A: [karmaNpc.id], B: [foe.id], log: [] }, karmaNpc, foe, { M: 1.2, type: 'm', isSkill: true, forced: true });
assert(ks.debtPool < 100 && ks.karmicDebt === ks.debtPool, 'Karma debtPool and karmicDebt must both decrease after retaliation strike');
CULT.ensureKarmaState(karmaNpc);
assert.strictEqual(ks.debtPool, ks.karmicDebt, 'ensureKarmaState must not refill spent debtPool');

// Verify Heal/Buff cleanse & harmonic_pavilion scaling
STATS.addStatus(mechNpc, 'poison', 20, { per: 0.02 }, W.t);
mechNpc.h.state.hp = Math.round(CULT.hpMax(mechNpc) * 0.4);
const hbRes = CULT.castHealOrBuff(W, sageNpc, mechNpc, { buffId: 'clarityLotus', duration: 60, now: W.t });
assert(hbRes && hbRes.ok && (hbRes.healed > 0 || hbRes.healAmount > 0 || mechNpc.h.state.hp > Math.round(CULT.hpMax(mechNpc) * 0.4)), 'castHealOrBuff should heal target');
assert(!STATS.has(mechNpc, 'poison', W.t), 'castHealOrBuff should cleanse negative poison debuff');
assert(STATS.hasBuff(mechNpc, 'clarityLotus', W.t), 'castHealOrBuff should apply clarityLotus buff');

console.log('PASS v209_facilities_party_synergy_suite');
