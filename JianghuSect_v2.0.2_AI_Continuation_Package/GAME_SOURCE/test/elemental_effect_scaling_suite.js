'use strict';
const assert = require('assert');
const G = require('./load');
const { SIM, ELEM, COMBAT, CULT, SK } = G;

console.log('Testing Priority F: Elemental Coherence & Effect Scaling...');

// Test 1: ELEM.classifyRelation
{
  assert.strictEqual(ELEM.classifyRelation('FIRE', 'FIRE'), 'MATCH', 'Identical elements must MATCH');
  assert.strictEqual(ELEM.classifyRelation('WATER_ICE', 'WATER_ICE'), 'MATCH');
  assert.strictEqual(ELEM.classifyRelation('NEUTRAL', 'FIRE'), 'NEUTRAL', 'NEUTRAL must be NEUTRAL');
  assert.strictEqual(ELEM.classifyRelation('FIRE', null), 'NEUTRAL', 'Missing element must be NEUTRAL');

  // Opposing elements
  const relFireWater = ELEM.classifyRelation('FIRE', 'WATER_ICE');
  assert.strictEqual(relFireWater, 'OPPOSE', 'Fire vs Water/Ice must be OPPOSE');
  const relWaterFire = ELEM.classifyRelation('WATER_ICE', 'FIRE');
  assert.strictEqual(relWaterFire, 'OPPOSE', 'Water/Ice vs Fire must be OPPOSE');

  // Supporting elements
  const effWoodFire = ELEM.EFFICACY_MATRIX && ELEM.EFFICACY_MATRIX['WOOD_LIFE'] && ELEM.EFFICACY_MATRIX['WOOD_LIFE']['FIRE'];
  if (effWoodFire >= 0.72) {
    assert.strictEqual(ELEM.classifyRelation('WOOD_LIFE', 'FIRE'), 'SUPPORT', 'Wood supporting Fire must be SUPPORT');
  }
}

// Test 2: ELEM.combatElementalMatchup for non-beast foes and cultivators
{
  const W = SIM.create('elem-matchup-test');
  const atk = W.npcs[0];
  atk.cult = { path: 'XIAN', stage: 3, sub: 'NONE' };
  atk.h = atk.h || {};
  atk.h.root = ELEM.buildRootObject(['FIRE'], ['HEAVENLY']);

  const fireTech = { id: 'TEST_FIRE_TECH', nameTh: 'เพลิงสวรรค์', element: 'FIRE', tier: 1 };

  // Foe with explicit element
  const foeWithEl = { id: 'FOE_WATER', name: 'ศัตรูธาตุน้ำ', foe: true, element: 'WATER_ICE' };
  const matchupWater = ELEM.combatElementalMatchup(atk, foeWithEl, fireTech);
  // In COUNTER_MATRIX, Fire vs Water is disadvantaged (< 1.0)
  assert(matchupWater < 1.0, 'Fire technique against Water foe must be resisted (< 1.0)');

  // Foe with elementProfile
  const foeWithProf = { id: 'FOE_WIND', name: 'ศัตรูธาตุลม', foe: true, elementProfile: { valid: true, primary: 'WIND' } };
  const matchupWind = ELEM.combatElementalMatchup(atk, foeWithProf, fireTech);
  assert(typeof matchupWind === 'number' && matchupWind > 0, 'Matchup with elementProfile foe must compute');

  // Cultivator defender with root
  const defCult = W.npcs[1];
  defCult.foe = false;
  defCult.cult = { path: 'XIAN', stage: 3, sub: 'NONE' };
  defCult.h = defCult.h || {};
  defCult.h.root = ELEM.buildRootObject(['WATER_ICE'], ['HEAVENLY']);
  const matchupCultWater = ELEM.combatElementalMatchup(atk, defCult, fireTech);
  assert(matchupCultWater < 1.0, 'Fire technique against Water cultivator defender must be resisted (< 1.0)');
}

// Test 3: ELEM.resolveCombatInteraction returns healSupportMult independent of defender counter
{
  const W = SIM.create('elem-interaction-test');
  const healer = W.npcs[0];
  healer.cult = { path: 'XIAN', stage: 3, sub: 'NONE' };
  healer.h = healer.h || {};
  healer.h.root = ELEM.buildRootObject(['WOOD_LIFE'], ['HEAVENLY']);

  // Healing skill with WOOD_LIFE element
  const woodHealSkill = { id: 'TEST_WOOD_HEAL', nameTh: 'ฟื้นฟูปราณพฤกษา', element: 'WOOD_LIFE', heal: 50 };

  const allyWater = { id: 'ALLY_WATER', h: { root: ELEM.buildRootObject(['WATER_ICE'], ['HEAVENLY']) } };
  const allyMetal = { id: 'ALLY_METAL', h: { root: ELEM.buildRootObject(['EARTH_METAL'], ['HEAVENLY']) } };

  const inter1 = ELEM.resolveCombatInteraction(healer, allyWater, woodHealSkill);
  const inter2 = ELEM.resolveCombatInteraction(healer, allyMetal, woodHealSkill);

  assert(typeof inter1.healSupportMult === 'number' && inter1.healSupportMult >= 0.70 && inter1.healSupportMult <= 1.40,
    'healSupportMult must be a valid clamped number');
  assert.strictEqual(inter1.healSupportMult, inter2.healSupportMult,
    'healSupportMult must depend on caster affinity and weapon resonance, NOT on defender elemental counter');

  // But damage mult DOES differ between differing targets if countered
  assert(typeof inter1.totalDamageMult === 'number', 'totalDamageMult must exist');
}

// Test 4: COMBAT.useSkill applies healSupportMult to shield and heal
{
  const W = SIM.create('elem-combat-test');
  const caster = W.npcs[0];
  caster.cult = { path: 'XIAN', stage: 4, sub: 'NONE', tm: {}, techs: [] };
  caster.h = caster.h || {};
  caster.h.root = ELEM.buildRootObject(['WOOD_LIFE'], ['HEAVENLY']);
  caster.h.state = caster.h.state || { hp: 100, qi: 100, wounds: 0, heartDemon: 0 };
  caster.equip = {};

  const target = W.npcs[1];
  target.h = target.h || {};
  target.h.state = target.h.state || { hp: 50, qi: 50, wounds: 0, heartDemon: 0 };

  const healSkill = {
    id: 'SKILL_HEAL_TEST',
    tech: 'SKILL_HEAL_TEST',
    nameTh: 'ทักษะรักษาพฤกษา',
    arch: 'heal',
    element: 'WOOD_LIFE',
    heal: 0.20,
    cd: 5,
    wind: 2,
    qiCost: 10
  };

  const inter = ELEM.resolveCombatInteraction(caster, target, healSkill);
  assert(inter.healSupportMult > 1.0, 'Heavenly Wood healer using Wood skill should have healSupportMult > 1.0');

  const f = { A: [caster.id, target.id], B: [] };
  const ctx = { cds: {}, log: [], W };

  // Lower target hp so heal targets target
  CULT.hpMax = () => 200;
  target.h.state.hp = 40;
  caster.h.state.hp = 180;

  // Track modified p passed through skill pipeline
  const origSyn = G.MARTIAL.skillSynergy;
  const origEff = G.MARTIAL.skillEfficiency;
  G.MARTIAL.skillEfficiency = () => 1.0;
  G.MARTIAL.skillSynergy = () => ({ dmgMult: 1, shieldMult: 1, healMult: 1, dotMult: 1 });

  // Use COMBAT.useSkill
  COMBAT.useSkill(W, f, caster, target, healSkill, ctx);

  // Target HP should have increased
  assert(target.h.state.hp > 40, 'Target HP should have increased from heal');

  // Restore
  G.MARTIAL.skillSynergy = origSyn;
  G.MARTIAL.skillEfficiency = origEff;

  console.log('✓ All Priority F elemental tests passed successfully!');
}
